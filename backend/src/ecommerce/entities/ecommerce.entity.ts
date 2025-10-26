import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { ecommerceDetail } from './ecommerceDetail.entity';

@Entity('ecommerce')
@Index(['status', 'createdAt']) // Índice para consultas frecuentes
@Index(['client']) // Índice para búsquedas por cliente
@Index(['vendor']) // Índice para búsquedas por vendedor
export class Ecommerce {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Usuario que realiza la compra (Cliente)
   */
  @ManyToOne(() => User, (user) => user.ecommerceAsClient, {
    onDelete: 'SET NULL',
    nullable: true, // Permite ventas sin cliente registrado
  })
  @JoinColumn({ name: 'client_id' })
  client: User;

  /**
   * Nombre del cliente (puede ser diferente al nombre del usuario)
   * Se guarda por si el nombre del usuario cambia después
   */
  @Column({ type: 'varchar', length: 100 })
  nameClient: string;

  /**
   * Nombre de la empresa del cliente (opcional)
   * Para facturación con razón social
   */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'name_company' })
  nameCompany?: string;

  /**
   * Estado de la venta
   * - Pendiente: Creada pero no confirmada/pagada
   * - Vendido: Confirmada y pagada
   * - Rechazado: Cancelada (devuelve stock)
   */
  @Column({
    type: 'varchar',
    length: 25,
    default: 'Pendiente',
  })
  @Index() // Índice para filtrar por status
  status: string;

  /**
   * Monto total de la venta
   * Se calcula automáticamente sumando todos los subtotales
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  total: number;

  /**
   * Usuario que procesa/registra la venta (Vendedor o Administrador)
   */
  @ManyToOne(() => User, (user) => user.ecommerceAsVendor, {
    onDelete: 'SET NULL',
    nullable: false, // Siempre debe haber un vendedor
  })
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  /**
   * Detalles de la venta (productos, cantidades, precios)
   * Relación uno a muchos con eager loading para cargar automáticamente
   */
  @OneToMany(
    () => ecommerceDetail,
    (ecommerceDetail) => ecommerceDetail.ecommerce,
    {
      eager: true,
      cascade: true, // Guarda/elimina detalles automáticamente
    },
  )
  ecommerceDetail: ecommerceDetail[];

  // ==================== CAMPOS PARA STRIPE ====================

  /**
   * ID del Payment Intent de Stripe
   * Se guarda cuando se crea la intención de pago
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'payment_intent_id',
  })
  @Index() // Índice para búsquedas rápidas por payment intent
  paymentIntentId?: string;

  /**
   * Estado del pago en Stripe
   * - pending: Esperando pago
   * - processing: Procesando pago
   * - succeeded: Pago exitoso
   * - failed: Pago fallido
   * - canceled: Pago cancelado
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'pending',
    name: 'payment_status',
  })
  paymentStatus?: string;

  /**
   * Método de pago utilizado
   * - stripe: Pago con tarjeta vía Stripe
   * - cash: Pago en efectivo
   * - transfer: Transferencia bancaria
   * - qr: Pago con QR
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'cash',
    name: 'payment_method',
  })
  paymentMethod?: string;

  /**
   * Fecha y hora en que se completó el pago
   * Se actualiza cuando el pago es exitoso
   */
  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'paid_at',
  })
  paidAt?: Date;

  /**
   * ID del cliente en Stripe (Customer ID)
   * Se guarda para futuras compras y pagos recurrentes
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'stripe_customer_id',
  })
  stripeCustomerId?: string;

  /**
   * Moneda utilizada en la transacción
   * - BOB: Bolivianos
   * - USD: Dólares americanos
   */
  @Column({
    type: 'varchar',
    length: 3,
    default: 'BOB',
  })
  currency: string;

  /**
   * Notas adicionales sobre el pago o la venta
   * Puede incluir detalles de transferencia, número de recibo, etc.
   */
  @Column({
    type: 'text',
    nullable: true,
    name: 'payment_notes',
  })
  paymentNotes?: string;

  /**
   * URL del recibo/factura generado
   * Puede ser un enlace a Stripe o un PDF generado internamente
   */
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'receipt_url',
  })
  receiptUrl?: string;

  /**
   * Indica si se requiere factura con NIT
   * true = el cliente solicitó factura formal
   */
  @Column({
    type: 'boolean',
    default: false,
    name: 'requires_invoice',
  })
  requiresInvoice: boolean;

  /**
   * NIT del cliente para facturación
   * Se guarda si requiresInvoice es true
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'client_nit',
  })
  clientNit?: string;

  // ==================== CAMPOS DE AUDITORÍA ====================

  /**
   * Fecha de creación del registro
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Fecha de última actualización del registro
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * IP desde la cual se creó la venta (opcional, para seguridad)
   */
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    name: 'created_from_ip',
  })
  createdFromIp?: string;

  /**
   * Dispositivo desde el cual se creó la venta (web, mobile, pos)
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: 'web',
    name: 'device_type',
  })
  deviceType?: string;
}