import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEcommerceDto } from './dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from './dto/update-ecommerce.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ecommerce } from './entities/ecommerce.entity';
import { DataSource, Repository } from 'typeorm';
import { ecommerceDetail } from './entities/ecommerceDetail.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EcommerceService {
  constructor(
    @InjectRepository(Ecommerce)
    private readonly ecommerceRepository: Repository<Ecommerce>,
    @InjectRepository(ecommerceDetail)
    private readonly ecommerceDetailRepository: Repository<ecommerceDetail>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una nueva venta (ecommerce) con transacción completa
   * @param createEcommerceDto - Datos de la venta
   * @param vendorId - ID del vendedor autenticado (viene del JWT)
   * @returns La venta creada con todas sus relaciones
   */
  async create(
    createEcommerceDto: CreateEcommerceDto,
    vendorId: string,
  ): Promise<Ecommerce> {
    // Crear query runner para transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        clientId,
        nameClient,
        nameCompany,
        status = 'Pendiente',
        ecommerceDetail: detailsDto,
      } = createEcommerceDto;

      // Validar que el vendedor existe y está activo
      if (!vendorId) {
        throw new BadRequestException(
          'Se requiere un vendedor para procesar la venta',
        );
      }

      const vendor = await queryRunner.manager.findOne(User, {
        where: { id: vendorId, isActive: true },
        relations: ['role'],
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendedor con id ${vendorId} no encontrado o inactivo`,
        );
      }

      // Validar rol del vendedor
      const vendorRole = vendor.role?.name?.toLowerCase();
      if (!vendorRole || !['administrador', 'vendedor'].includes(vendorRole)) {
        throw new BadRequestException(
          `El usuario con rol "${vendor.role?.name || 'sin rol'}" no puede crear ventas`,
        );
      }

      // Validar que el cliente existe y está activo
      const client = await queryRunner.manager.findOne(User, {
        where: { id: clientId, isActive: true },
      });

      if (!client) {
        throw new NotFoundException(
          `Cliente con id ${clientId} no encontrado o inactivo`,
        );
      }

      // Validar rol del cliente
      const clientRole = client.role?.name?.toLowerCase();
      if (clientRole && clientRole === 'cliente') {
        // El cliente tiene el rol correcto
      } else {
        throw new BadRequestException(
          `El usuario con id ${clientId} no es un cliente válido`,
        );
      }

      // Validar que hay productos en el detalle
      if (!detailsDto || detailsDto.length === 0) {
        throw new BadRequestException(
          'Debe incluir al menos un producto en la venta',
        );
      }

      // Crear la entidad ecommerce principal
      const ecommerce = queryRunner.manager.create(Ecommerce, {
        client,
        vendor,
        nameClient: nameClient || `${client.firstName} ${client.lastName}`,
        nameCompany: nameCompany || client.companyName,
        status,
        total: 0, // Se calculará después
      });

      const savedEcommerce = await queryRunner.manager.save(Ecommerce, ecommerce);

      let totalEcommerce = 0;
      const detailsToSave: ecommerceDetail[] = [];

      // Procesar cada detalle de la venta
      for (const detail of detailsDto) {
        // Obtener el producto con validaciones
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: detail.productId },
          relations: ['category'],
        });

        // Validar existencia del producto
        if (!product) {
          throw new NotFoundException(
            `Producto con id ${detail.productId} no existe`,
          );
        }

        // Validar que el producto está activo
        if (!product.isActive) {
          throw new BadRequestException(
            `El producto "${product.name}" no está activo`,
          );
        }

        // Validar que el producto está disponible
        if (!product.isAvailable) {
          throw new BadRequestException(
            `El producto "${product.name}" no está disponible para la venta`,
          );
        }

        // Validar stock disponible
        if (product.stock < detail.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${detail.quantity}`,
          );
        }

        // Validar cantidad mínima
        if (detail.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad para "${product.name}" debe ser mayor a 0`,
          );
        }

        // Calcular precios
        const unitPrice = product.price;
        const subTotal = unitPrice * detail.quantity;
        totalEcommerce += subTotal;

        // Crear detalle
        const detailEntity = queryRunner.manager.create(ecommerceDetail, {
          ecommerce: savedEcommerce,
          product,
          quantity: detail.quantity,
          unitPrice,
          subTotal,
        });

        detailsToSave.push(detailEntity);

        // Descontar stock del producto
        product.stock -= detail.quantity;

        // Si el stock llega a 0, marcar como no disponible
        if (product.stock === 0) {
          product.isAvailable = false;
        }

        await queryRunner.manager.save(Product, product);
      }

      // Guardar todos los detalles
      await queryRunner.manager.save(ecommerceDetail, detailsToSave);

      // Actualizar el total de la venta
      savedEcommerce.total = totalEcommerce;
      savedEcommerce.ecommerceDetail = detailsToSave;
      await queryRunner.manager.save(Ecommerce, savedEcommerce);

      // Confirmar transacción
      await queryRunner.commitTransaction();

      // Retornar la venta con todas sus relaciones
      return this.findOne(savedEcommerce.id);
    } catch (error) {
      // Revertir transacción en caso de error
      await queryRunner.rollbackTransaction();

      // Re-lanzar el error para que el controller lo maneje
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Error inesperado
      throw new InternalServerErrorException(
        `Error al crear la venta: ${error.message}`,
      );
    } finally {
      // Liberar el query runner
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todas las ventas activas (Pendiente y Vendido)
   * @returns Array de ventas con sus relaciones
   */
  async findAll(): Promise<Ecommerce[]> {
    try {
      return await this.ecommerceRepository.find({
        where: [{ status: 'Pendiente' }, { status: 'Vendido' }],
        relations: [
          'ecommerceDetail',
          'ecommerceDetail.product',
          'ecommerceDetail.product.category',
          'client',
          'client.role',
          'vendor',
          'vendor.role',
        ],
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las ventas: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene una venta por su ID
   * @param id - UUID de la venta
   * @returns La venta encontrada con todas sus relaciones
   */
  async findOne(id: string): Promise<Ecommerce> {
    try {
      const ecommerce = await this.ecommerceRepository.findOne({
        where: [
          { id, status: 'Pendiente' },
          { id, status: 'Vendido' },
        ],
        relations: [
          'ecommerceDetail',
          'ecommerceDetail.product',
          'ecommerceDetail.product.category',
          'ecommerceDetail.product.images',
          'client',
          'client.role',
          'vendor',
          'vendor.role',
        ],
      });

      if (!ecommerce) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }

      return ecommerce;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener la venta: ${error.message}`,
      );
    }
  }

  /**
   * Actualiza una venta existente
   * IMPORTANTE: Solo permite actualizar status y nameCompany
   * Los productos no se pueden modificar una vez creada la venta
   * @param id - UUID de la venta
   * @param updateEcommerceDto - Datos a actualizar
   * @returns La venta actualizada
   */
  async update(
    id: string,
    updateEcommerceDto: UpdateEcommerceDto,
  ): Promise<Ecommerce> {
    try {
      // Verificar que la venta existe
      const ecommerce = await this.findOne(id);

      // Validar que la venta no esté rechazada
      if (ecommerce.status === 'Rechazado') {
        throw new BadRequestException(
          'No se puede actualizar una venta rechazada',
        );
      }

      // Si se intenta cambiar el status a "Vendido", validar que estaba en "Pendiente"
      if (updateEcommerceDto.status === 'Vendido') {
        if (ecommerce.status !== 'Pendiente') {
          throw new BadRequestException(
            'Solo se pueden marcar como vendidas las ventas en estado Pendiente',
          );
        }
      }

      // Si se intenta rechazar, validar que no esté ya vendida
      if (updateEcommerceDto.status === 'Rechazado') {
        if (ecommerce.status === 'Vendido') {
          throw new BadRequestException(
            'No se puede rechazar una venta ya procesada',
          );
        }

        // Si se rechaza, devolver el stock
        await this.restoreStock(ecommerce);
      }

      // Preparar datos para actualizar (solo campos permitidos)
      const allowedFields: Partial<Ecommerce> = {};

      if (updateEcommerceDto.status) {
        allowedFields.status = updateEcommerceDto.status;
      }

      if (updateEcommerceDto.nameCompany !== undefined) {
        allowedFields.nameCompany = updateEcommerceDto.nameCompany;
      }

      // Actualizar
      await this.ecommerceRepository.update(id, allowedFields);

      // Retornar la venta actualizada
      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar la venta: ${error.message}`,
      );
    }
  }

  /**
   * Marca una venta como rechazada (soft delete)
   * Devuelve el stock de los productos al inventario
   * @param id - UUID de la venta
   * @returns Mensaje de confirmación
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const ecommerce = await this.findOne(id);

      // Validar que no esté ya rechazada
      if (ecommerce.status === 'Rechazado') {
        throw new BadRequestException('Esta venta ya está rechazada');
      }

      // Validar que no esté vendida
      if (ecommerce.status === 'Vendido') {
        throw new BadRequestException(
          'No se puede rechazar una venta ya procesada. Debe crear una devolución.',
        );
      }

      // Devolver stock a los productos
      await this.restoreStock(ecommerce);

      // Marcar como rechazada
      await this.ecommerceRepository.update(id, { status: 'Rechazado' });

      return {
        message: `Venta de ${ecommerce.client.firstName} ${ecommerce.client.lastName} fue rechazada correctamente. Stock restaurado.`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al rechazar la venta: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene todas las ventas de un cliente específico
   * @param userId - ID del cliente
   * @returns Array de ventas del cliente
   */
  async findByUser(userId: string): Promise<Ecommerce[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true },
        relations: [
          'ecommerceAsClient',
          'ecommerceAsClient.ecommerceDetail',
          'ecommerceAsClient.ecommerceDetail.product',
          'ecommerceAsClient.ecommerceDetail.product.category',
          'ecommerceAsClient.ecommerceDetail.product.images',
          'ecommerceAsClient.vendor',
        ],
      });

      if (!user) {
        throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
      }

      // Filtrar solo ventas activas (no rechazadas)
      const activeOrders =
        user.ecommerceAsClient?.filter(
          (order) => order.status !== 'Rechazado',
        ) || [];

      return activeOrders.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener las ventas del cliente: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene todas las ventas procesadas por un vendedor específico
   * @param userId - ID del vendedor
   * @returns Array de ventas procesadas por el vendedor
   */
  async findByVendor(userId: string): Promise<Ecommerce[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true },
        relations: [
          'ecommerceAsVendor',
          'ecommerceAsVendor.ecommerceDetail',
          'ecommerceAsVendor.ecommerceDetail.product',
          'ecommerceAsVendor.ecommerceDetail.product.category',
          'ecommerceAsVendor.client',
          'ecommerceAsVendor.client.role',
        ],
      });

      if (!user) {
        throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
      }

      return (
        user.ecommerceAsVendor?.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ) || []
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener las ventas del vendedor: ${error.message}`,
      );
    }
  }

  /**
   * Restaura el stock de productos cuando se rechaza una venta
   * @param ecommerce - La venta que se va a rechazar
   * @private
   */
  private async restoreStock(ecommerce: Ecommerce): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const detail of ecommerce.ecommerceDetail) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: detail.product.id },
        });

        if (product) {
          // Restaurar stock
          product.stock += detail.quantity;

          // Si ahora hay stock, marcar como disponible
          if (product.stock > 0) {
            product.isAvailable = true;
          }

          await queryRunner.manager.save(Product, product);
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error al restaurar el stock: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene estadísticas de ventas
   * @returns Objeto con estadísticas
   */
  async getStatistics(): Promise<{
    totalVentas: number;
    totalPendientes: number;
    totalVendidas: number;
    totalRechazadas: number;
    montoTotal: number;
    montoPendiente: number;
    montoVendido: number;
  }> {
    try {
      const allEcommerce = await this.ecommerceRepository.find();

      const statistics = {
        totalVentas: allEcommerce.length,
        totalPendientes: allEcommerce.filter((e) => e.status === 'Pendiente')
          .length,
        totalVendidas: allEcommerce.filter((e) => e.status === 'Vendido')
          .length,
        totalRechazadas: allEcommerce.filter((e) => e.status === 'Rechazado')
          .length,
        montoTotal: allEcommerce.reduce((sum, e) => sum + Number(e.total), 0),
        montoPendiente: allEcommerce
          .filter((e) => e.status === 'Pendiente')
          .reduce((sum, e) => sum + Number(e.total), 0),
        montoVendido: allEcommerce
          .filter((e) => e.status === 'Vendido')
          .reduce((sum, e) => sum + Number(e.total), 0),
      };

      return statistics;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener estadísticas: ${error.message}`,
      );
    }
  }
}