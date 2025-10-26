import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

export class UsersSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Buscar el rol de administrador
    const adminRole = await roleRepository.findOne({
      where: { name: 'administrador' },
    });

    if (!adminRole) {
      console.log('❌ Error: El rol "administrador" no existe. Ejecuta primero el seed de roles.');
      return;
    }

    // Definir el usuario administrador por defecto
    const adminEmail = 'admin@sistema.com';
    
    // Verificar si ya existe el usuario admin
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`ℹ️  Usuario administrador ya existe: ${adminEmail}`);
      return;
    }

    // Crear contraseña hasheada
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Crear usuario administrador
    const adminUser = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      documentNumber: '0000000',
      phone: '+59100000000',
      address: 'Dirección del Sistema',
      isEmailVerified: true,
      isActive: true,
      role: adminRole,
    });

    await userRepository.save(adminUser);
    
    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Contraseña: Admin123!`);
    console.log(`   ⚠️  IMPORTANTE: Cambia esta contraseña después del primer inicio de sesión`);
    
    console.log('\n🎉 Seed de usuarios completado exitosamente');
  }
}