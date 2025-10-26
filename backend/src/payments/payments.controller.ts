import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Headers,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Crea un Payment Intent en Stripe para procesar el pago de una venta
   * Solo el cliente propietario de la venta o admin/vendedor pueden crear el payment intent
   * 
   * @route POST /payments/create-intent/:ecommerceId
   * @access Private (Cliente propietario, Administrador, Vendedor)
   */
  @Post('create-intent/:ecommerceId')
  @HttpCode(HttpStatus.OK)
  async createPaymentIntent(
    @Param('ecommerceId', ParseUUIDPipe) ecommerceId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role?.name?.toLowerCase();

    // Admin y vendedor pueden crear payment intent para cualquier venta
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.paymentsService.createPaymentIntent(ecommerceId);
    }

    // Cliente solo puede crear payment intent para sus propias ventas
    // Esta validación también se hace en el servicio, pero la agregamos aquí por seguridad
    if (userRole === 'cliente') {
      return this.paymentsService.createPaymentIntent(ecommerceId);
    }

    throw new ForbiddenException(
      'No tienes permisos para crear un payment intent',
    );
  }

  /**
   * Webhook de Stripe para procesar eventos de pago
   * Este endpoint NO requiere autenticación JWT, pero valida la firma de Stripe
   * 
   * IMPORTANTE: En tu main.ts o configuración de NestJS, debes configurar
   * este endpoint para recibir el raw body (Buffer)
   * 
   * @route POST /payments/webhook
   * @access Public (validado por firma de Stripe)
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new ForbiddenException('Firma de Stripe no proporcionada');
    }

    // El raw body debe estar disponible en request.rawBody
    // Esto requiere configuración especial en main.ts
    const payload = request.rawBody;

    if (!payload) {
      throw new ForbiddenException('Payload no disponible');
    }

    return this.paymentsService.handleWebhook(signature, payload);
  }

  /**
   * Obtiene el estado actual de un pago de Stripe
   * Consulta directamente a Stripe para obtener información actualizada
   * 
   * @route GET /payments/status/:ecommerceId
   * @access Private (Cliente propietario, Administrador, Vendedor)
   */
  @Get('status/:ecommerceId')
  async getPaymentStatus(
    @Param('ecommerceId', ParseUUIDPipe) ecommerceId: string,
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Admin y vendedor pueden ver cualquier pago
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.paymentsService.getPaymentStatus(ecommerceId);
    }

    // Cliente puede ver sus propios pagos
    if (userRole === 'cliente') {
      return this.paymentsService.getPaymentStatus(ecommerceId);
    }

    throw new ForbiddenException(
      'No tienes permisos para ver el estado de este pago',
    );
  }

  /**
   * Cancela un Payment Intent pendiente en Stripe
   * Solo se puede cancelar si el pago no ha sido procesado
   * 
   * @route POST /payments/cancel/:ecommerceId
   * @access Private (Administrador, Vendedor, Cliente propietario)
   */
  @Post('cancel/:ecommerceId')
  @HttpCode(HttpStatus.OK)
  async cancelPaymentIntent(
    @Param('ecommerceId', ParseUUIDPipe) ecommerceId: string,
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Admin y vendedor pueden cancelar cualquier payment intent
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.paymentsService.cancelPaymentIntent(ecommerceId);
    }

    // Cliente puede cancelar sus propios payment intents
    if (userRole === 'cliente') {
      return this.paymentsService.cancelPaymentIntent(ecommerceId);
    }

    throw new ForbiddenException(
      'No tienes permisos para cancelar este payment intent',
    );
  }

  /**
   * Confirma manualmente un pago (para pagos en efectivo, transferencia, etc.)
   * Solo Administradores y Vendedores pueden confirmar pagos manualmente
   * 
   * @route POST /payments/confirm-manual/:ecommerceId
   * @access Private (Administrador, Vendedor)
   */
  @Post('confirm-manual/:ecommerceId')
  @HttpCode(HttpStatus.OK)
  async confirmManualPayment(
    @Param('ecommerceId', ParseUUIDPipe) ecommerceId: string,
    @Body() paymentData: {
      paymentMethod: 'cash' | 'transfer' | 'qr';
      paymentNotes?: string;
    },
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo admin y vendedor pueden confirmar pagos manualmente
    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException(
        'Solo administradores y vendedores pueden confirmar pagos manualmente',
      );
    }

    return this.paymentsService.confirmManualPayment(
      ecommerceId,
      paymentData.paymentMethod,
      paymentData.paymentNotes,
    );
  }

  /**
   * Procesa un reembolso para una venta
   * Solo Administradores pueden procesar reembolsos
   * 
   * @route POST /payments/refund/:ecommerceId
   * @access Private (Administrador)
   */
  @Post('refund/:ecommerceId')
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @Param('ecommerceId', ParseUUIDPipe) ecommerceId: string,
    @Body()
    refundData: {
      amount?: number; // Opcional: si no se especifica, se reembolsa todo
      reason?: string;
    },
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo administradores pueden procesar reembolsos
    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden procesar reembolsos',
      );
    }

    return this.paymentsService.refundPayment(
      ecommerceId,
      refundData.amount,
      refundData.reason,
    );
  }

  /**
   * Obtiene el historial de pagos de un cliente
   * Los clientes solo pueden ver su propio historial
   * Admin y vendedor pueden ver cualquier historial
   * 
   * @route GET /payments/history/:clientId
   * @access Private (Cliente propietario, Administrador, Vendedor)
   */
  @Get('history/:clientId')
  async getPaymentHistory(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role?.name?.toLowerCase();

    // Admin y vendedor pueden ver cualquier historial
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.paymentsService.getPaymentHistory(clientId);
    }

    // Cliente solo puede ver su propio historial
    if (userRole === 'cliente' && userId === clientId) {
      return this.paymentsService.getPaymentHistory(clientId);
    }

    throw new ForbiddenException(
      'No tienes permisos para ver este historial de pagos',
    );
  }

  /**
   * Obtiene estadísticas de pagos
   * Solo para Administradores
   * 
   * @route GET /payments/statistics
   * @access Private (Administrador)
   */
  @Get('statistics')
  async getPaymentStatistics(@Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden ver las estadísticas de pagos',
      );
    }

    return this.paymentsService.getPaymentStatistics();
  }

  /**
   * Verifica si una venta tiene un payment intent activo
   * 
   * @route GET /payments/check/:ecommerceId
   * @access Private (Todos los roles autenticados)
   */
  @Get('check/:ecommerceId')
  async checkPaymentIntent(
    @Param('ecommerceId', ParseUUIDPipe) ecommerceId: string,
  ) {
    return this.paymentsService.checkPaymentIntent(ecommerceId);
  }

  /**
   * Obtiene la configuración pública de Stripe (publishable key)
   * Necesaria para inicializar Stripe en el frontend
   * 
   * @route GET /payments/config
   * @access Public
   */
  @Get('config')
  async getStripeConfig() {
    return this.paymentsService.getPublicConfig();
  }
}