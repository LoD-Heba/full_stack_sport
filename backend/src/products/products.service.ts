import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ProductImage } from './entities/product-image.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly producImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const { categoryId, images = [], ...producData } = createProductDto;
    const category = await this.findCategoryOrThrow(categoryId);

    const product = this.productRepository.create({
      ...producData,
      category,
      images: images.map((imageUrl) => {
        // 🔹 Guarda la URL COMPLETA tal como viene del uploads controller
        // Ya viene como: http://localhost:3001/images/filename.webp
        return this.producImageRepository.create({ url: imageUrl });
      }),
    });

    return this.productRepository.save(product);
  }

  async findAll(PaginationDto: PaginationDto) {
    return await this.productRepository.find({
      where: { isActive: true, category: { isActive: true } },
      relations: ['category', 'images'], 
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id, isActive: true, category: { isActive: true }
      },
      relations: ['category', 'images'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, images, ...productData } = updateProductDto;

    // verifica si el producto existe y si está activo
    await this.findOne(id);

    const product = await this.productRepository.preload({
      id, ...productData
    });

    // verifica si la categoría existe para poder actualizar 
    if (categoryId) {
      product!.category = await this.findCategoryOrThrow(categoryId);
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Elimina las imágenes existentes
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // 🔹 Crea nuevas imágenes - URLs completas tal como vienen
        product!.images = images.map((imageUrl) => {
          return this.producImageRepository.create({ url: imageUrl });
        });
      }

      // guarda el producto actualizado 
      await queryRunner.manager.save(Product, product!);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.update(
      id, { isActive: false }
    );
    return {
      message: `product (${product.name}) has been deactivated`
    };
  }

  private async findCategoryOrThrow(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
      isActive: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }
    return category;
  }

  async findByCategory(categoryId: string) {
    return await this.productRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category', 'images'], 
    });
  }
}