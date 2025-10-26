import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario (REGISTRO PÚBLICO)
   * Si se proporciona roleId, se asigna ese rol
   * Si NO se proporciona roleId, se asigna automáticamente el rol "Cliente"
   * @route POST /users
   * @access Public
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    // ✅ Ahora pasamos el DTO completo, incluyendo roleId si existe
    return this.usersService.create(createUserDto);
  }

  /**
   * Obtiene el perfil de un usuario por ID
   * NOTA: En producción esto debería estar protegido
   * @route GET /users/profile/:id
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Get('profile/:id')
  async getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Actualiza el perfil de un usuario
   * @route PATCH /users/profile/:id
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Patch('profile/:id')
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // No permitir cambio de rol en la ruta de perfil
    const { roleId, ...safeUpdateDto } = updateUserDto;
    return this.usersService.update(id, safeUpdateDto);
  }

  /**
   * Obtiene los pedidos de un usuario
   * @route GET /users/orders/:id
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Get('orders/:id')
  async getUserOrders(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserOrders(id);
  }

  /**
   * Obtiene todos los usuarios activos
   * @route GET /users
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtiene un usuario específico por ID
   * @route GET /users/:id
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Actualiza un usuario existente (permite cambiar rol)
   * @route PATCH /users/:id
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // ✅ En esta ruta SÍ permitimos cambiar el rol
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Desactiva un usuario (soft delete)
   * @route DELETE /users/:id
   * @access Public (SOLO PARA DESARROLLO)
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}