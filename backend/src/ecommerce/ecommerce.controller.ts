import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { CreateEcommerceDto } from './dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from './dto/update-ecommerce.dto';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  /**
   * Crea una nueva venta
   * Solo usuarios con rol Administrador o Vendedor pueden crear ventas
   * El vendedor se obtiene automáticamente del JWT
   * 
   * @route POST /ecommerce
   * @access Private (Administrador, Vendedor)
   */
  @Post()
  @UseGuards(JwtUserAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEcommerceDto: CreateEcommerceDto, @Req() req) {
    const vendorId = req.user.id;
    const vendorRole = req.user.role?.name?.toLowerCase();

    // Validar que el usuario autenticado sea Administrador o Vendedor
    if (!vendorRole || !['administrador', 'vendedor'].includes(vendorRole)) {
      throw new ForbiddenException(
        `No tienes permisos para crear ventas. Tu rol actual es: ${req.user.role?.name || 'sin rol'}`,
      );
    }

    return this.ecommerceService.create(createEcommerceDto, vendorId);
  }

  /**
   * Obtiene todas las ventas del sistema
   * Solo Administradores y Vendedores pueden ver todas las ventas
   * 
   * @route GET /ecommerce
   * @access Private (Administrador, Vendedor)
   */
  @Get()
  @UseGuards(JwtUserAuthGuard)
  async findAll(@Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo admin y vendedor pueden ver todas las ventas
    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException(
        'No tienes permisos para ver todas las ventas',
      );
    }

    return this.ecommerceService.findAll();
  }

  /**
   * Obtiene las ventas del usuario autenticado
   * Los clientes solo ven sus propias compras
   * Los vendedores ven las ventas que procesaron
   * Los administradores ven todas
   * 
   * @route GET /ecommerce/my-orders
   * @access Private (Todos los roles autenticados)
   */
  @Get('my-orders')
  @UseGuards(JwtUserAuthGuard)
  async findMyOrders(@Req() req, @Query('type') type?: string) {
    const userId = req.user.id;
    const userRole = req.user.role?.name?.toLowerCase();

    // Si es cliente, solo mostrar sus compras
    if (userRole === 'cliente') {
      return this.ecommerceService.findByUser(userId);
    }

    // Si es vendedor o admin, pueden ver:
    // - type=client: ventas donde ellos son el cliente (compras personales)
    // - type=vendor o sin type: ventas que procesaron
    if (userRole === 'vendedor' || userRole === 'administrador') {
      if (type === 'client') {
        return this.ecommerceService.findByUser(userId);
      }
      return this.ecommerceService.findByVendor(userId);
    }

    // Rol desconocido
    throw new ForbiddenException('Rol no válido para acceder a pedidos');
  }

  /**
   * Obtiene las ventas procesadas por un vendedor específico
   * Solo Administradores pueden consultar ventas de otros vendedores
   * Los vendedores solo pueden ver sus propias ventas
   * 
   * @route GET /ecommerce/vendor/:vendorId
   * @access Private (Administrador, Vendedor - solo propias)
   */
  @Get('vendor/:vendorId')
  @UseGuards(JwtUserAuthGuard)
  async findByVendor(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();
    const userId = req.user.id;

    // Administradores pueden ver cualquier vendedor
    if (userRole === 'administrador') {
      return this.ecommerceService.findByVendor(vendorId);
    }

    // Vendedores solo pueden ver sus propias ventas
    if (userRole === 'vendedor' && userId === vendorId) {
      return this.ecommerceService.findByVendor(vendorId);
    }

    throw new ForbiddenException(
      'No tienes permisos para ver las ventas de este vendedor',
    );
  }

  /**
   * Obtiene las compras de un cliente específico
   * Solo Administradores y Vendedores pueden consultar compras de clientes
   * Los clientes solo pueden ver sus propias compras
   * 
   * @route GET /ecommerce/client/:clientId
   * @access Private (Administrador, Vendedor, Cliente - solo propias)
   */
  @Get('client/:clientId')
  @UseGuards(JwtUserAuthGuard)
  async findByClient(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();
    const userId = req.user.id;

    // Administradores y vendedores pueden ver cualquier cliente
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.ecommerceService.findByUser(clientId);
    }

    // Clientes solo pueden ver sus propias compras
    if (userRole === 'cliente' && userId === clientId) {
      return this.ecommerceService.findByUser(clientId);
    }

    throw new ForbiddenException(
      'No tienes permisos para ver las compras de este cliente',
    );
  }

  /**
   * Obtiene estadísticas del sistema de ventas
   * Solo Administradores pueden ver estadísticas
   * 
   * @route GET /ecommerce/statistics
   * @access Private (Administrador)
   */
  @Get('statistics')
  @UseGuards(JwtUserAuthGuard)
  async getStatistics(@Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden ver las estadísticas',
      );
    }

    return this.ecommerceService.getStatistics();
  }

  /**
   * Obtiene una venta específica por ID
   * - Administradores y Vendedores: pueden ver cualquier venta
   * - Clientes: solo pueden ver sus propias compras
   * 
   * @route GET /ecommerce/:id
   * @access Private (Todos los roles autenticados)
   */
  @Get(':id')
  @UseGuards(JwtUserAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();
    const userId = req.user.id;

    const ecommerce = await this.ecommerceService.findOne(id);

    // Administradores y vendedores pueden ver cualquier venta
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return ecommerce;
    }

    // Clientes solo pueden ver sus propias compras
    if (userRole === 'cliente' && ecommerce.client.id === userId) {
      return ecommerce;
    }

    throw new ForbiddenException('No tienes permisos para ver esta venta');
  }

  /**
   * Actualiza una venta existente
   * Solo se pueden actualizar ciertos campos:
   * - status: Cambiar estado de la venta
   * - nameCompany: Actualizar nombre de empresa
   * 
   * Restricciones:
   * - No se pueden modificar los productos una vez creada la venta
   * - Solo Administradores y Vendedores pueden actualizar
   * - No se puede actualizar una venta rechazada
   * 
   * @route PATCH /ecommerce/:id
   * @access Private (Administrador, Vendedor)
   */
  @Patch(':id')
  @UseGuards(JwtUserAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEcommerceDto: UpdateEcommerceDto,
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo admin y vendedor pueden actualizar
    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException('No tienes permisos para actualizar ventas');
    }

    // Validar que no intenten modificar productos o cliente
    if (
      updateEcommerceDto.clientId ||
      updateEcommerceDto.ecommerceDetail ||
      updateEcommerceDto.nameClient
    ) {
      throw new ForbiddenException(
        'No se pueden modificar los productos o el cliente de una venta existente',
      );
    }

    return this.ecommerceService.update(id, updateEcommerceDto);
  }

  /**
   * Marca una venta como rechazada (soft delete)
   * Devuelve el stock de los productos al inventario
   * 
   * Restricciones:
   * - No se puede rechazar una venta ya procesada (Vendido)
   * - Solo Administradores y Vendedores pueden rechazar
   * - Una venta rechazada no se puede reactivar
   * 
   * @route DELETE /ecommerce/:id
   * @access Private (Administrador, Vendedor)
   */
  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo admin y vendedor pueden rechazar ventas
    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException('No tienes permisos para rechazar ventas');
    }

    return this.ecommerceService.remove(id);
  }

  /**
   * Marca una venta pendiente como vendida
   * Atajo para actualizar el status a "Vendido"
   * 
   * @route PATCH /ecommerce/:id/mark-as-sold
   * @access Private (Administrador, Vendedor)
   */
  @Patch(':id/mark-as-sold')
  @UseGuards(JwtUserAuthGuard)
  async markAsSold(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException(
        'No tienes permisos para marcar ventas como vendidas',
      );
    }

    return this.ecommerceService.update(id, { status: 'Vendido' });
  }

  /**
   * Marca una venta como pendiente
   * Útil para revertir una venta marcada accidentalmente como vendida
   * Solo funciona si no ha pasado mucho tiempo
   * 
   * @route PATCH /ecommerce/:id/mark-as-pending
   * @access Private (Administrador)
   */
  @Patch(':id/mark-as-pending')
  @UseGuards(JwtUserAuthGuard)
  async markAsPending(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo administradores pueden revertir a pendiente
    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden revertir ventas a pendiente',
      );
    }

    return this.ecommerceService.update(id, { status: 'Pendiente' });
  }

  /**
   * Obtiene el resumen de una venta para impresión/factura
   * Devuelve datos formateados para PDF
   * 
   * @route GET /ecommerce/:id/invoice
   * @access Private (Todos los roles autenticados)
   */
  @Get(':id/invoice')
  @UseGuards(JwtUserAuthGuard)
  async getInvoice(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();
    const userId = req.user.id;

    const ecommerce = await this.ecommerceService.findOne(id);

    // Administradores y vendedores pueden ver cualquier factura
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.formatInvoice(ecommerce);
    }

    // Clientes solo pueden ver sus propias facturas
    if (userRole === 'cliente' && ecommerce.client.id === userId) {
      return this.formatInvoice(ecommerce);
    }

    throw new ForbiddenException('No tienes permisos para ver esta factura');
  }

  /**
   * Formatea los datos de una venta para factura
   * @private
   */
  private formatInvoice(ecommerce: any) {
    return {
      invoiceNumber: ecommerce.id,
      date: ecommerce.createdAt,
      status: ecommerce.status,
      client: {
        name: ecommerce.nameClient,
        company: ecommerce.nameCompany,
        email: ecommerce.client.email,
        phone: ecommerce.client.phone,
        address: ecommerce.client.address,
        taxId: ecommerce.client.taxId,
      },
      vendor: {
        name: `${ecommerce.vendor.firstName} ${ecommerce.vendor.lastName}`,
        email: ecommerce.vendor.email,
      },
      items: ecommerce.ecommerceDetail.map((detail: any) => ({
        product: detail.product.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subTotal,
      })),
      subtotal: ecommerce.total,
      tax: 0, // Implementar si es necesario
      total: ecommerce.total,
    };
  }
}