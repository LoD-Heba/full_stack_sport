import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { RolesSeed } from './roles.seed';
import { UsersSeed } from './users.seed'; // Nuevo seed para usuarios
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
  logging: true, // Activar logging para ver qué está pasando
});

async function runSeeds() {
  try {
    console.log('🌱 Iniciando seeds...\n');
    console.log('📋 Configuración de base de datos:');
    console.log(`   Host: ${configService.get<string>('DB_HOST', 'localhost')}`);
    console.log(`   Puerto: ${configService.get<string>('DB_PORT', '5432')}`);
    console.log(`   Base de datos: ${configService.get<string>('DB_NAME')}`);
    console.log(`   Usuario: ${configService.get<string>('DB_USERNAME', 'postgres')}\n`);

    // Inicializar conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar seed de roles PRIMERO
    console.log('📝 Ejecutando seed de roles...');
    const rolesSeed = new RolesSeed();
    await rolesSeed.run(AppDataSource);
    console.log('');

    // Ejecutar seed de usuarios (incluye admin por defecto)
    console.log('👤 Ejecutando seed de usuarios...');
    const usersSeed = new UsersSeed();
    await usersSeed.run(AppDataSource);
    console.log('');

    console.log('✅ Todos los seeds se ejecutaron correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seeds:');
    console.error(error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar seeds
runSeeds();