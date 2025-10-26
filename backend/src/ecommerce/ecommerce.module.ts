import { Module } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { EcommerceController } from './ecommerce.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ecommerce } from './entities/ecommerce.entity';
import { ecommerceDetail } from './entities/ecommerceDetail.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Product } from 'src/products/entities/product.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Ecommerce, ecommerceDetail, User, Product ]), AuthModule],
  controllers: [EcommerceController],
  providers: [EcommerceService],
  exports: [EcommerceService, TypeOrmModule],
})
export class EcommerceModule {}
