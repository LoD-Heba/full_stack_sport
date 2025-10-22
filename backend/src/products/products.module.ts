import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Product, Category, ProductImage])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService,]
})
export class ProductsModule {}
