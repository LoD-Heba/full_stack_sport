import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario
   * Ruta pública para registro de clientes
   * Si se intenta asignar un rol diferente a "Cliente", se ignora (seguridad)
   * 
   * @route POST /users
   * @access Public
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    // Por seguridad, remover roleId del registro público
    // Solo se puede registrar como cliente
    const { roleId, ...userData } = createUserDto;

    return this.usersService.create(userData);
  }

  /**
   * Crea un usuario con rol específico (solo administradores)
   * Permite asignar roles de Vendedor o Administrador
   * 
   * @route POST /users/admin
   * @access Private (Solo Administrador)
   */
  @Post('admin')
  async createWithRole(
    @Body() createUserDto: CreateUserDto,
    @Req() req,
  ) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo administradores pueden crear usuarios con roles específicos
    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden asignar roles específicos',
      );
    }

    return this.usersService.create(createUserDto);
  }

  /**
   * Obtiene todos los usuarios activos
   * Solo administradores y vendedores pueden ver todos los usuarios
   * 
   * @route GET /users
   * @access Private (Administrador, Vendedor)
   */
  @Get()
  async findAll(@Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo admin y vendedor pueden ver todos los usuarios
    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException(
        'No tienes permisos para ver todos los usuarios',
      );
    }

    return this.usersService.findAll();
  }

  /**
   * Obtiene un usuario específico por ID
   * Los usuarios solo pueden ver su propia información
   * Administradores y vendedores pueden ver cualquier usuario
   * 
   * @route GET /users/:id
   * @access Private (Todos los roles autenticados)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userId = req.user.id;
    const userRole = req.user.role?.name?.toLowerCase();

    // Admin y vendedor pueden ver cualquier usuario
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.usersService.findOne(id);
    }

    // Usuarios normales solo pueden ver su propia información
    if (userId !== id) {
      throw new ForbiddenException(
        'Solo puedes ver tu propia información',
      );
    }

    return this.usersService.findOne(id);
  }

  /**
   * Actualiza un usuario existente
   * Los usuarios pueden actualizar su propia información (excepto rol)
   * Solo administradores pueden cambiar roles
   * 
   * @route PATCH /users/:id
   * @access Private (Todos los roles autenticados)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role?.name?.toLowerCase();

    // Si no es administrador y intenta cambiar el rol, denegar
    if (updateUserDto.roleId && userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden cambiar roles de usuario',
      );
    }

    // Admin puede actualizar cualquier usuario
    if (userRole === 'administrador') {
      return this.usersService.update(id, updateUserDto);
    }

    // Usuarios normales solo pueden actualizar su propia información
    if (userId !== id) {
      throw new ForbiddenException(
        'Solo puedes actualizar tu propia información',
      );
    }

    // Remover roleId del DTO si el usuario no es admin
    const { roleId, ...safeUpdateDto } = updateUserDto;

    return this.usersService.update(id, safeUpdateDto);
  }

  /**
   * Desactiva un usuario (soft delete)
   * Solo administradores pueden desactivar usuarios
   * 
   * @route DELETE /users/:id
   * @access Private (Solo Administrador)
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user.role?.name?.toLowerCase();

    // Solo administradores pueden desactivar usuarios
    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden desactivar usuarios',
      );
    }

    return this.usersService.remove(id);
  }
}