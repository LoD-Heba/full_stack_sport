import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export class RolesSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);

    // Definir los roles base del sistema
    const roles = [
      {
        name: 'administrador',
        description:
          'Acceso total al sistema. Puede gestionar usuarios, productos, ventas y configuraciones.',
      },
      {
        name: 'vendedor',
        description:
          'Puede procesar ventas, ver productos y gestionar pedidos. No tiene acceso a configuraciones del sistema.',
      },
      {
        name: 'cliente',
        description:
          'Usuario final que puede realizar compras y ver su historial de pedidos.',
      },
    ];

    // Insertar roles solo si no existen
    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`✅ Rol creado: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Rol ya existe: ${roleData.name}`);
      }
    }

    console.log('🎉 Seed de roles completado exitosamente');
  }
}