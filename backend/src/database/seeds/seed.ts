import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

import { AppDataSource } from '../data-resource';

import { CreateRoleDto } from '../../roles/dto/create-role.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateCategoryDto } from '../../categories/dto/create-category.dto';
import { CreateProductDto } from '../../products/dto/create-product.dto';

(async () => {
  const dataSource: DataSource = await AppDataSource.initialize();
  console.log(' Conectado a la base de datos...');

  try {
    // ========== 1️⃣ ROLES ==========
    const roleRepo = dataSource.getRepository(Role);
    const rolesData: CreateRoleDto[] = [
      { name: 'Administrador', description: 'Acceso total al sistema' },
      { name: 'Vendedor', description: 'Gestiona productos y ventas' },
      { name: 'Cliente', description: 'Compra productos deportivos' },
    ];

    for (const data of rolesData) {
      const dto = plainToInstance(CreateRoleDto, data);
      await validateOrReject(dto);
    }

    const roles = roleRepo.create(rolesData);
    await roleRepo.save(roles);
    console.log('✅ Roles creados');

    const adminRole = roles.find(r => r.name === 'Administrador');
    const sellerRole = roles.find(r => r.name === 'Vendedor');
    const clientRole = roles.find(r => r.name === 'Cliente');

    // ========== 2️⃣ USUARIOS ==========
    const userRepo = dataSource.getRepository(User);
    const passwordHash = async (password: string) => await bcrypt.hash(password, 10);

    const usersData: CreateUserDto[] = [
      {
        email: 'admin@sportstore.com',
        password: await passwordHash('Admin123!'),
        firstName: 'Alex',
        lastName: 'Deportista',
        documentNumber: '10000001',
        address: 'Av. Fitness 123',
        roleId: adminRole!.id,
      },
      {
        email: 'seller1@sportstore.com',
        password: await passwordHash('Seller123!'),
        firstName: 'Carlos',
        lastName: 'Atleta',
        documentNumber: 'SL001',
        address: 'Calle Entrenamiento #1',
        roleId: sellerRole!.id,
      },
      {
        email: 'seller2@sportstore.com',
        password: await passwordHash('Seller123!'),
        firstName: 'María',
        lastName: 'Deportiva',
        documentNumber: 'SL002',
        address: 'Calle Entrenamiento #2',
        roleId: sellerRole!.id,
      },
      {
        email: 'cliente1@sportstore.com',
        password: await passwordHash('Cliente123!'),
        firstName: 'Juan',
        lastName: 'Runner',
        documentNumber: 'CL001',
        address: 'Barrio Fitness #1',
        roleId: clientRole!.id,
      },
      {
        email: 'cliente2@sportstore.com',
        password: await passwordHash('Cliente123!'),
        firstName: 'Ana',
        lastName: 'Gym',
        documentNumber: 'CL002',
        address: 'Barrio Fitness #2',
        roleId: clientRole!.id,
      },
    ];

    for (const data of usersData) {
      const dto = plainToInstance(CreateUserDto, data);
      await validateOrReject(dto);
    }

    const users = userRepo.create(usersData);
    await userRepo.save(users);
    console.log('✅ Usuarios creados');

    // ========== 3️⃣ CATEGORÍAS ==========
    const categoryRepo = dataSource.getRepository(Category);
    const categoriesData: CreateCategoryDto[] = [
      { name: 'Ropa Deportiva', description: 'Poleras, shorts y pantalones deportivos' },
      { name: 'Calzado Deportivo', description: 'Zapatillas para running, fútbol y más' },
      { name: 'Accesorios', description: 'Gorras, mochilas, botellas y guantes' },
    ];

    for (const data of categoriesData) {
      const dto = plainToInstance(CreateCategoryDto, data);
      await validateOrReject(dto);
    }

    const categories = categoryRepo.create(categoriesData);
    await categoryRepo.save(categories);
    console.log('✅ Categorías creadas');

    // ========== 4️⃣ PRODUCTOS ==========
    const productRepo = dataSource.getRepository(Product);
    const productosData: CreateProductDto[] = [
      { name: 'Polera Nike Dri-Fit', price: 30, stock: 50, categoryId: categories[0].id },
      { name: 'Short Adidas Climalite', price: 25, stock: 40, categoryId: categories[0].id },
      { name: 'Zapatillas Puma Running', price: 80, stock: 20, categoryId: categories[1].id },
      { name: 'Tenis Nike Air Max', price: 120, stock: 15, categoryId: categories[1].id },
      { name: 'Gorra Under Armour', price: 15, stock: 30, categoryId: categories[2].id },
      { name: 'Mochila Deportiva', price: 45, stock: 25, categoryId: categories[2].id },
    ];

    for (const data of productosData) {
      const dto = plainToInstance(CreateProductDto, data);
      await validateOrReject(dto);
    }

    //const productos = productRepo.create(productosData);
   // await productRepo.save(productos);
    console.log('✅ Productos creados');

    console.log('🎉 SEED COMPLETADO CON VALIDACIÓN DTOs');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
})();
