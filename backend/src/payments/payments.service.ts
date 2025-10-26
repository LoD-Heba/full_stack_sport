import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import Stripe from 'stripe';
import { Ecommerce } from 'src/ecommerce/entities/ecommerce.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Ecommerce)
    private readonly ecommerceRepository: Repository<Ecommerce>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Inicializar Stripe con la clave secreta
    const stripeSecretKey =
      this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY no está configurada en las variables de entorno',
      );
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  /**
   * Crea un Payment Intent en Stripe para una venta
   * @param ecommerceId - ID de la venta
   * @returns Client secret y payment intent ID para el frontend
   */
  async createPaymentIntent(ecommerceId: string) {
    try {
      // Buscar la venta
      const ecommerce = await this.ecommerceRepository.findOne({
        where: { id: ecommerceId },
        relations: ['client', 'vendor', 'ecommerceDetail'],
      });

      if (!ecommerce) {
        throw new NotFoundException(
          `Venta con id ${ecommerceId} no encontrada`,
        );
      }

      // Validar que la venta esté en estado Pendiente
      if (ecommerce.status !== 'Pendiente') {
        throw new BadRequestException(
          `Esta venta ya fue procesada. Estado actual: ${ecommerce.status}`,
        );
      }

      // Validar que no tenga ya un payment intent
      if (ecommerce.paymentIntentId) {
        // Recuperar el payment intent existente
        const existingIntent = await this.stripe.paymentIntents.retrieve(
          ecommerce.paymentIntentId,
        );

        // Si ya fue pagado, actualizar la venta
        if (existingIntent.status === 'succeeded') {
          await this.handleSuccessfulPayment(ecommerce.paymentIntentId);
          throw new BadRequestException('Esta venta ya fue pagada');
        }

        // Si está pendiente, devolver el mismo client secret
        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation'
        ) {
          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
            amount: existingIntent.amount,
            currency: existingIntent.currency,
          };
        }
      }

      // Obtener o crear el cliente en Stripe
      let stripeCustomerId = ecommerce.stripeCustomerId;

      if (!stripeCustomerId && ecommerce.client) {
        const stripeCustomer = await this.createOrGetStripeCustomer(
          ecommerce.client,
        );
        stripeCustomerId = stripeCustomer.id;

        // Guardar el Stripe Customer ID en el ecommerce y en el usuario
        await this.ecommerceRepository.update(ecommerceId, {
          stripeCustomerId,
        });
      }

      // Calcular el monto en centavos
      const amountInCents = Math.round(ecommerce.total * 100);

      // Validar monto mínimo (Stripe requiere al menos 50 centavos)
      if (amountInCents < 50) {
        throw new BadRequestException(
          'El monto mínimo para procesar un pago es 0.50',
        );
      }

      // Crear el Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: ecommerce.currency.toLowerCase(),
        customer: stripeCustomerId,
        metadata: {
          ecommerceId: ecommerce.id,
          clientId: ecommerce.client?.id || 'guest',
          vendorId: ecommerce.vendor.id,
          orderNumber: ecommerce.id,
        },
        description: `Venta ${ecommerce.id} - ${ecommerce.nameClient}`,
        receipt_email: ecommerce.client?.email,
        automatic_payment_methods: {
          enabled: true, // Permite múltiples métodos de pago
        },
      });

      // Guardar el Payment Intent ID en la venta
      await this.ecommerceRepository.update(ecommerceId, {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        paymentMethod: 'stripe',
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al crear el payment intent: ${error.message}`,
      );
    }
  }

  /**
   * Crea o recupera un cliente en Stripe
   * @param user - Usuario del sistema
   * @returns Cliente de Stripe
   */
  private async createOrGetStripeCustomer(user: User): Promise<Stripe.Customer> {
    try {
      // Buscar si el usuario ya tiene un Stripe Customer ID
      // (esto debería estar en la entidad User, añadir columna si no existe)

      // Buscar en Stripe por email
      const existingCustomers = await this.stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Crear nuevo cliente en Stripe
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        address: {
          line1: user.address,
        },
        metadata: {
          userId: user.id,
          documentNumber: user.documentNumber,
        },
      });

      return customer;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear cliente en Stripe: ${error.message}`,
      );
    }
  }

  /**
   * Maneja el webhook de Stripe para confirmar pagos
   * @param signature - Firma del webhook para validación
   * @param payload - Datos del evento
   * @returns Confirmación del procesamiento
   */
  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET no está configurado',
      );
    }

    let event: Stripe.Event;

    try {
      // Verificar que el evento viene de Stripe
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Maneja un pago exitoso
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const ecommerceId = paymentIntent.metadata.ecommerceId;

    if (!ecommerceId) {
      console.error('Payment Intent sin metadata de ecommerce');
      return;
    }

    await this.handleSuccessfulPayment(paymentIntent.id);
  }

  /**
   * Actualiza la venta cuando el pago es exitoso
   */
  private async handleSuccessfulPayment(paymentIntentId: string) {
    try {
      const ecommerce = await this.ecommerceRepository.findOne({
        where: { paymentIntentId },
      });

      if (!ecommerce) {
        console.error(
          `Ecommerce no encontrado para payment intent: ${paymentIntentId}`,
        );
        return;
      }

      // Actualizar estado de la venta
      await this.ecommerceRepository.update(ecommerce.id, {
        status: 'Vendido',
        paymentStatus: 'succeeded',
        paidAt: new Date(),
      });

      // Aquí puedes agregar lógica adicional:
      // - Enviar email de confirmación
      // - Generar factura
      // - Notificar al vendedor
      // - etc.

      console.log(`Venta ${ecommerce.id} marcada como Vendida`);
    } catch (error) {
      console.error('Error al procesar pago exitoso:', error);
    }
  }

  /**
   * Maneja un pago fallido
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const ecommerceId = paymentIntent.metadata.ecommerceId;

    if (!ecommerceId) {
      return;
    }

    await this.ecommerceRepository.update(
      { paymentIntentId: paymentIntent.id },
      {
        paymentStatus: 'failed',
      },
    );

    console.log(`Pago fallido para venta: ${ecommerceId}`);
  }

  /**
   * Maneja un pago cancelado
   */
  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    const ecommerceId = paymentIntent.metadata.ecommerceId;

    if (!ecommerceId) {
      return;
    }

    await this.ecommerceRepository.update(
      { paymentIntentId: paymentIntent.id },
      {
        paymentStatus: 'canceled',
      },
    );

    console.log(`Pago cancelado para venta: ${ecommerceId}`);
  }

  /**
   * Maneja un reembolso
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      return;
    }

    const ecommerce = await this.ecommerceRepository.findOne({
      where: { paymentIntentId },
    });

    if (!ecommerce) {
      return;
    }

    // Aquí deberías implementar la lógica de devolución:
    // - Restaurar stock
    // - Marcar como rechazado o crear un registro de devolución
    // - etc.

    console.log(`Reembolso procesado para venta: ${ecommerce.id}`);
  }

  /**
   * Cancela un Payment Intent
   * @param ecommerceId - ID de la venta
   */
  async cancelPaymentIntent(ecommerceId: string) {
    try {
      const ecommerce = await this.ecommerceRepository.findOne({
        where: { id: ecommerceId },
      });

      if (!ecommerce) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (!ecommerce.paymentIntentId) {
        throw new BadRequestException(
          'Esta venta no tiene un payment intent asociado',
        );
      }

      // Cancelar en Stripe
      await this.stripe.paymentIntents.cancel(ecommerce.paymentIntentId);

      // Actualizar en la base de datos
      await this.ecommerceRepository.update(ecommerceId, {
        paymentStatus: 'canceled',
      });

      return {
        message: 'Payment intent cancelado exitosamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al cancelar payment intent: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el estado de un pago
   * @param ecommerceId - ID de la venta
   */
  async getPaymentStatus(ecommerceId: string) {
    try {
      const ecommerce = await this.ecommerceRepository.findOne({
        where: { id: ecommerceId },
      });

      if (!ecommerce) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (!ecommerce.paymentIntentId) {
        return {
          status: 'no_payment_intent',
          message: 'Esta venta no tiene un payment intent asociado',
        };
      }

      // Obtener el estado desde Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        ecommerce.paymentIntentId,
      );

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        created: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al obtener estado del pago: ${error.message}`,
      );
    }
  }

  // Agregar estos métodos al payments.service.ts:

/**
 * Confirma un pago manual (efectivo, transferencia, QR)
 */
async confirmManualPayment(
  ecommerceId: string,
  paymentMethod: string,
  paymentNotes?: string,
) {
  try {
    const ecommerce = await this.ecommerceRepository.findOne({
      where: { id: ecommerceId },
    });

    if (!ecommerce) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (ecommerce.status !== 'Pendiente') {
      throw new BadRequestException(
        `Esta venta ya fue procesada. Estado: ${ecommerce.status}`,
      );
    }

    await this.ecommerceRepository.update(ecommerceId, {
      status: 'Vendido',
      paymentMethod,
      paymentStatus: 'succeeded',
      paymentNotes,
      paidAt: new Date(),
    });

    return {
      message: 'Pago confirmado exitosamente',
      ecommerceId,
      paymentMethod,
    };
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(
      `Error al confirmar pago: ${error.message}`,
    );
  }
}

/**
 * Procesa un reembolso
 */
async refundPayment(
  ecommerceId: string,
  amount?: number,
  reason?: string,
) {
  try {
    const ecommerce = await this.ecommerceRepository.findOne({
      where: { id: ecommerceId },
    });

    if (!ecommerce) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (!ecommerce.paymentIntentId) {
      throw new BadRequestException(
        'Esta venta no tiene un pago procesado con Stripe',
      );
    }

    // Crear el reembolso en Stripe
    const refund = await this.stripe.refunds.create({
      payment_intent: ecommerce.paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: 'requested_by_customer',
      metadata: {
        ecommerceId: ecommerce.id,
        refundReason: reason || 'No especificado',
      },
    });

    return {
      message: 'Reembolso procesado exitosamente',
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(
      `Error al procesar reembolso: ${error.message}`,
    );
  }
}

/**
 * Obtiene el historial de pagos de un cliente
 */
async getPaymentHistory(clientId: string) {
  try {
    const payments = await this.ecommerceRepository.find({
      where: {
        client: { id: clientId },
        paymentIntentId: Not(IsNull()),
      },
      relations: ['vendor', 'ecommerceDetail', 'ecommerceDetail.product'],
      order: { createdAt: 'DESC' },
    });

    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.total,
      currency: payment.currency,
      status: payment.status,
      paymentStatus: payment.paymentStatus,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    }));
  } catch (error) {
    throw new InternalServerErrorException(
      `Error al obtener historial: ${error.message}`,
    );
  }
}

/**
 * Obtiene estadísticas de pagos
 */
async getPaymentStatistics() {
  try {
    const allPayments = await this.ecommerceRepository.find({
      where: { paymentIntentId: Not(IsNull()) },
    });

    const statistics = {
      totalPagos: allPayments.length,
      pagosPendientes: allPayments.filter((p) => p.paymentStatus === 'pending')
        .length,
      pagosExitosos: allPayments.filter((p) => p.paymentStatus === 'succeeded')
        .length,
      pagosFallidos: allPayments.filter((p) => p.paymentStatus === 'failed')
        .length,
      montoTotal: allPayments.reduce((sum, p) => sum + Number(p.total), 0),
      montoStripe: allPayments
        .filter((p) => p.paymentMethod === 'stripe')
        .reduce((sum, p) => sum + Number(p.total), 0),
      montoEfectivo: allPayments
        .filter((p) => p.paymentMethod === 'cash')
        .reduce((sum, p) => sum + Number(p.total), 0),
    };

    return statistics;
  } catch (error) {
    throw new InternalServerErrorException(
      `Error al obtener estadísticas: ${error.message}`,
    );
  }
}

/**
 * Verifica si existe un payment intent activo
 */
async checkPaymentIntent(ecommerceId: string) {
  try {
    const ecommerce = await this.ecommerceRepository.findOne({
      where: { id: ecommerceId },
    });

    if (!ecommerce) {
      throw new NotFoundException('Venta no encontrada');
    }

    return {
      hasPaymentIntent: !!ecommerce.paymentIntentId,
      paymentIntentId: ecommerce.paymentIntentId,
      paymentStatus: ecommerce.paymentStatus,
      paymentMethod: ecommerce.paymentMethod,
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException(
      `Error al verificar payment intent: ${error.message}`,
    );
  }
}

/**
 * Obtiene la configuración pública de Stripe
 */
async getPublicConfig() {
  const publishableKey = this.configService.get<string>(
    'STRIPE_PUBLISHABLE_KEY',
  );

  if (!publishableKey) {
    throw new InternalServerErrorException(
      'Configuración de Stripe no disponible',
    );
  }

  return {
    publishableKey,
  };
}
}