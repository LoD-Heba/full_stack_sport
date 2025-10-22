import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';

@Controller('products')
export class ProductsController {
  constructor(
      @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,


    private readonly productsService: ProductsService) { }

    @Get(':id/images')
  async findImages(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return product.images; // 🔹 Devuelve solo las imágenes
  }
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() PaginationDto: PaginationDto) {
    return this.productsService.findAll(PaginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // src/products/products.controller.ts
  @Get('category/:id')
  findByCategory(@Param('id') id: string) {
    return this.productsService.findByCategory(id);
  }

}
