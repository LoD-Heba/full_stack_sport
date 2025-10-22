import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEcommerceDto } from './dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from './dto/update-ecommerce.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ecommerce } from './entities/ecommerce.entity';
import { Repository } from 'typeorm';
import { ecommerceDetail } from './entities/ecommerceDetail.entity';
import { Product } from 'src/products/entities/product.entity';
import { Client } from 'src/clients/entities/client.entity';

@Injectable()
export class EcommerceService {
  constructor(
    @InjectRepository(Ecommerce)
    private readonly ecommerceRepository: Repository<Ecommerce>,
    @InjectRepository(ecommerceDetail)
    private readonly ecommerceDetailRepository: Repository<ecommerceDetail>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async create(createEcommerceDto: CreateEcommerceDto) {
    const { clientId, nameClient, nameCompany, status = 'Pendiente', total, userId, ecommerceDetail } = createEcommerceDto;

    const ecommerce = this.ecommerceRepository.create({
      client: { id: clientId } as any,
      nameClient,
      nameCompany,
      status,
      total: 0,
      users: { id: userId } as any,
    });
    const savedEcommerce = await this.ecommerceRepository.save(ecommerce);

    let totalEcommerce = 0;

    const detailsToSave: ecommerceDetail[] = [];

    for (const detail of ecommerceDetail) {
      //Obtenemos el producto para sacar su precio
      const product = await this.ecommerceDetailRepository.manager.findOne(Product, {
        where: { id: detail.productId }
      });
      if (!product) {
        throw new NotFoundException(`producto con el id ${detail.productId} no existe`);
      }

      const unitPrice = product.price;
      const subTotal = unitPrice * detail.quantity;

      totalEcommerce += subTotal;

      const ecommerceDetail = this.ecommerceDetailRepository.create({
        ecommerce: savedEcommerce,
        product,
        quantity: detail.quantity,
        unitPrice,
        subTotal,
      });
      detailsToSave.push(ecommerceDetail);

      product.stock -= detail.quantity;
      await this.ecommerceDetailRepository.manager.save(product)
    };

    const savedDetails = await this.ecommerceDetailRepository.save(detailsToSave);

    //Actualiza el total del pedido Web
    savedEcommerce.total = totalEcommerce;
    savedEcommerce.ecommerceDetail = savedDetails;
    await this.ecommerceRepository.save(savedEcommerce);

    return savedEcommerce;
  }

  async findAll() {
    return await this.ecommerceRepository.find({
      where: [
        { status: 'Pendiente' },
        { status: 'Vendido' },
      ],
      relations: [
        'ecommerceDetail',
        'ecommerceDetail.product', // ✅ Trae la info de cada producto en los detalles
        'client',
        'users',
      ],
    });
  }


  async findOne(id: string) {
    const ecommerce = await this.ecommerceRepository.findOne({
      where: [
        { id, status: 'Pendiente' },
        { id, status: 'Vendido' },
      ],
      relations: ['ecommerceDetail',
        'client',
        'users',
        'ecommerceDetail.product'
      ],
    });
    if (!ecommerce) throw new NotFoundException(`ecommerce con el id ${id} no encontrado`);
    return ecommerce;
  }

  async update(id: string, updateEcommerceDto: UpdateEcommerceDto) {
  const ecommerce = await this.findOne(id);
  if (!ecommerce) {
    throw new NotFoundException(`ecommerce con el id ${id} no encontrado`);
  }
  
  const updatedEcommerce = await this.ecommerceRepository.preload({
    id,
    ...updateEcommerceDto,
  });

  if (!updatedEcommerce) {
    throw new NotFoundException(`ecommerce con el id ${id} no encontrado`);
  }

  return await this.ecommerceRepository.save(updatedEcommerce);
}

  async remove(id: string) {
    const ecommerce = await this.findOne(id);
    await this.ecommerceRepository.update(
      id, { status: 'Rechazado' });

    return { message: `ecommerce (${ecommerce.client.firstName}) fue Rechazado correctamente` };
  }

  async findByClient(clientId: string): Promise<Ecommerce[]> {
  const client = await this.clientRepository.findOne({
    where:{id: clientId},
    relations:['ecommerce', 'ecommerce.ecommerceDetail', 'ecommerce.ecommerceDetail.product']
  });
  return client?.ecommerce || [];
}
}
