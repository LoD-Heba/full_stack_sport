import { Module } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { EcommerceController } from './ecommerce.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ecommerce } from './entities/ecommerce.entity';
import { ecommerceDetail } from './entities/ecommerceDetail.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Ecommerce, ecommerceDetail])],
  controllers: [EcommerceController],
  providers: [EcommerceService],
  exports: [EcommerceService, TypeOrmModule],
})
export class EcommerceModule {}
