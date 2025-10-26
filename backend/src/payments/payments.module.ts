import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { EcommerceModule } from 'src/ecommerce/ecommerce.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ecommerce } from 'src/ecommerce/entities/ecommerce.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    ConfigModule, // Para acceder a las variables de entorno
    TypeOrmModule.forFeature([Ecommerce, User]),
    EcommerceModule, // Para acceder al servicio de ecommerce
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}