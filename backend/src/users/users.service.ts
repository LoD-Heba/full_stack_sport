import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Crea un nuevo usuario en el sistema
   * Si no se proporciona roleId, se asigna automáticamente el rol "Cliente"
   */
  async create(createUserDto: CreateUserDto) {
    const { roleId, password, email, ...userData } = createUserDto;

    // Verificar si el email ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        `El correo electrónico ${email} ya está registrado`,
      );
    }

    // Si no se proporciona roleId, buscar el rol "Cliente" por defecto
    let role: Role;
    if (roleId) {
      role = await this.findRoleOrThrow(roleId);
    } else {
      // Buscar rol "Cliente" como predeterminado
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'cliente', isActive: true },
      });

      if (!defaultRole) {
        throw new BadRequestException(
          'El rol "Cliente" no existe en el sistema. Por favor, ejecuta los seeds.',
        );
      }
      role = defaultRole;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = this.usersRepository.create({
      ...userData,
      email,
      password: hashedPassword,
      role,
    });

    // Guardar y retornar el usuario sin la contraseña
    const savedUser = await this.usersRepository.save(user);
    return await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });
  }

  async findAll() {
    return this.usersRepository.find({
      where: { isActive: true, role: { isActive: true } },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const userExist = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!userExist) {
      throw new NotFoundException(`Usuario con el id ${id} no encontrado`);
    }

    if (!userExist.isActive) {
      throw new BadRequestException(
        `El usuario con el id ${id} se encuentra deshabilitado`,
      );
    }

    return userExist;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExist = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!userExist) {
      throw new NotFoundException(`El usuario con el id ${id} no se encuentra`);
    }

    const { password, roleId, email, ...userData } = updateUserDto;

    // Si intenta cambiar el email, verificar que no exista
    if (email && email !== userExist.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email },
      });

      if (emailExists) {
        throw new ConflictException(
          `El correo electrónico ${email} ya está en uso`,
        );
      }
    }

    // En caso de que mande otra contraseña
    let updatePassword: string | undefined;
    if (password) {
      updatePassword = await bcrypt.hash(password, 12);
    }

    // Cambia el rol (solo si se proporciona)
    let rol: Role | undefined;
    if (roleId) {
      rol = await this.findRoleOrThrow(roleId);
    }

    const user = await this.usersRepository.preload({
      id,
      ...userData,
      ...(email && { email }),
      ...(updatePassword && { password: updatePassword }),
      ...(rol && { role: rol }),
    });

    if (!user) {
      throw new NotFoundException(
        `No se pudo cargar el usuario con id ${id} para actualizar sus datos`,
      );
    }

    await this.usersRepository.save(user);

    return await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async remove(id: string) {
    const user = (await this.findOne(id)) as User;
    await this.usersRepository.update(id, { isActive: false });
    return {
      message: `Usuario ${user.firstName} ${user.lastName} ha sido deshabilitado correctamente`,
    };
  }

  /**
   * Método privado para buscar y validar un rol
   */
  private async findRoleOrThrow(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
    });

    if (!role) {
      throw new NotFoundException(
        `Rol con ID ${roleId} no encontrado o inactivo`,
      );
    }

    return role;
  }
}