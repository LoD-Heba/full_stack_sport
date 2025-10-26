import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsIn,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsBoolean,
  Matches,
  IsIP,
} from 'class-validator';
import { CreateEcommerceDetailDto } from '../dto-detail/create-ecommerceDetail.dto';

export class CreateEcommerceDto {
  /**
   * ID del cliente que realiza la compra
   * Debe ser un UUID válido de un usuario con rol "Cliente"
   */
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  @IsUUID(4, { message: 'El ID del cliente debe ser un UUID válido' })
  clientId: string;

  /**
   * Nombre completo del cliente
   * Puede ser diferente al nombre registrado en el usuario
   * Útil si el cliente quiere facturar a nombre de otra persona
   */
  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  @Length(2, 100, {
    message: 'El nombre del cliente debe tener entre 2 y 100 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  nameClient?: string;

  /**
   * Nombre de la empresa del cliente (opcional)
   * Se usa para facturación con razón social
   */
  @IsOptional()
  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'El nombre de la empresa no puede exceder los 100 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  nameCompany?: string;

  /**
   * Estado inicial de la venta
   * Por defecto es "Pendiente"
   * Solo se permite establecer "Pendiente" al crear
   */
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['Pendiente'], {
    message: 'Al crear, el estado solo puede ser "Pendiente"',
  })
  @Transform(({ value }) => value?.toString().trim())
  status?: string;

  /**
   * Productos incluidos en la venta
   * Debe haber al menos un producto
   * Cada detalle incluye: productId, quantity
   */
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un producto en la venta' })
  @ValidateNested({ each: true })
  @Type(() => CreateEcommerceDetailDto)
  ecommerceDetail: CreateEcommerceDetailDto[];

  // ==================== CAMPOS PARA PAGOS ====================

  /**
   * Método de pago seleccionado
   * - stripe: Pago con tarjeta
   * - cash: Efectivo
   * - transfer: Transferencia
   * - qr: QR
   */
  @IsOptional()
  @IsString({ message: 'El método de pago debe ser una cadena de texto' })
  @IsIn(['stripe', 'cash', 'transfer', 'qr'], {
    message: 'El método de pago debe ser: stripe, cash, transfer o qr',
  })
  @Transform(({ value }) => value?.toString().toLowerCase().trim())
  paymentMethod?: string;

  /**
   * Moneda de la transacción
   * BOB = Bolivianos, USD = Dólares
   */
  @IsOptional()
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  @IsIn(['BOB', 'USD'], {
    message: 'La moneda debe ser BOB o USD',
  })
  @Transform(({ value }) => value?.toString().toUpperCase().trim())
  currency?: string;

  /**
   * Notas adicionales sobre el pago
   * Ej: "Transferencia realizada el 25/10, número de operación: 123456"
   */
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @MaxLength(500, {
    message: 'Las notas no pueden exceder los 500 caracteres',
  })
  @Transform(({ value }) => value?.toString().trim())
  paymentNotes?: string;

  // ==================== CAMPOS PARA FACTURACIÓN ====================

  /**
   * Indica si el cliente requiere factura formal con NIT
   */
  @IsOptional()
  @IsBoolean({ message: 'requiresInvoice debe ser true o false' })
  requiresInvoice?: boolean;

  /**
   * NIT del cliente para facturación
   * Requerido si requiresInvoice es true
   */
  @IsOptional()
  @IsString({ message: 'El NIT debe ser una cadena de texto' })
  @Matches(/^\d{5,15}$/, {
    message: 'El NIT debe contener entre 5 y 15 dígitos',
  })
  @Transform(({ value }) => value?.toString().trim())
  clientNit?: string;

  // ==================== CAMPOS DE AUDITORÍA ====================

  /**
   * IP desde la cual se está creando la venta (opcional)
   * Útil para auditoría y seguridad
   */
  @IsOptional()
  @IsIP(undefined, { message: 'Debe ser una dirección IP válida' })
  createdFromIp?: string;

  /**
   * Tipo de dispositivo desde el cual se crea la venta
   * - web: Navegador web
   * - mobile: Aplicación móvil
   * - pos: Terminal punto de venta
   */
  @IsOptional()
  @IsString({ message: 'El tipo de dispositivo debe ser una cadena de texto' })
  @IsIn(['web', 'mobile', 'pos'], {
    message: 'El tipo de dispositivo debe ser: web, mobile o pos',
  })
  @Transform(({ value }) => value?.toString().toLowerCase().trim())
  deviceType?: string;
}