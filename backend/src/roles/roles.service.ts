import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll() {
    return await this.roleRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id, isActive: true },
    });
    if (!role) {
      throw new NotFoundException(`El rol con el id ${id} no existe`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`El rol con el id ${id} no existe`);
    }
    const updatedRole = await this.roleRepository.preload({
      id,
      ...updateRoleDto,
    });
    if (!updatedRole) {
      throw new NotFoundException(`No se pudo preparar el rol con el id ${id}`);
    }
    return await this.roleRepository.save(updatedRole);
  }

  async remove(id: string) {
    const rol = await this.roleRepository.findOneBy({ id });
    if (!rol) {
      throw new NotFoundException(`El rol con el id ${id} no existe`);
    }
    await this.roleRepository.remove(rol);
    return { message: 'rol eliminado correctamente' };
  }
}
