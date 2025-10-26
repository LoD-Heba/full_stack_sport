import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { RolesSeed } from './roles.seed';
import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { Ecommerce } from '../../ecommerce/entities/ecommerce.entity';
import { ecommerceDetail } from '../../ecommerce/entities/ecommerceDetail.entity';
import { Order } from '../../orders/entities/order.entity';

import { ProductImage } from '../../products/entities/product-image.entity';

// Cargar variables de entorno
config();

const configService = new ConfigService();

// Crear DataSource para el seed
const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: parseInt(configService.get<string>('DB_PORT', '5432')),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [
    Role,
    User,
    Category,
    Product,
    ProductImage,
    Ecommerce,
    ecommerceDetail,
    Order,

  ],
  synchronize: false, // NO sincronizar automáticamente en seeds
});

async function runSeeds() {
  try {
    console.log('🌱 Iniciando seeds...\n');

    // Inicializar conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar seed de roles
    console.log('📝 Ejecutando seed de roles...');
    const rolesSeed = new RolesSeed();
    await rolesSeed.run(AppDataSource);

    console.log('\n✅ Todos los seeds se ejecutaron correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seeds:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar seeds
runSeeds();