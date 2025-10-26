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
   * Crea un nuevo usuario (REGISTRO PÚBLICO)
   * Solo se puede registrar como cliente
   * Para crear usuarios con otros roles, usar POST /users/admin
   * 
   * @route POST /users
   * @access Public
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    // Por seguridad, validar si se está intentando asignar un rol diferente a cliente
    if (createUserDto.roleId) {
      throw new ForbiddenException(
        'No puedes asignar roles manualmente. Los usuarios se registran como "Cliente" por defecto. ' +
        'Solo un administrador puede asignar roles diferentes.'
      );
    }

    // Remover roleId para forzar el rol de cliente por defecto
    const { roleId, ...userData } = createUserDto;

    return this.usersService.create(userData);
  }

  /**
   * Crea un usuario con rol específico (SOLO ADMINISTRADORES)
   * Permite asignar roles de Vendedor o Administrador
   * Requiere autenticación con token JWT
   * 
   * @route POST /users/admin
   * @access Private (Solo Administrador)
   */
  @Post('admin')
  @UseGuards(JwtUserAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createWithRole(
    @Body() createUserDto: CreateUserDto,
    @Req() req,
  ) {
    const userRole = req.user?.role?.name?.toLowerCase();

    // Solo administradores pueden crear usuarios con roles específicos
    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden asignar roles específicos a los usuarios'
      );
    }

    // Si no se proporciona roleId, se asignará cliente por defecto
    if (!createUserDto.roleId) {
      throw new ForbiddenException(
        'Debes especificar un roleId al crear usuarios desde este endpoint'
      );
    }

    return this.usersService.create(createUserDto);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @route GET /users/profile
   * @access Private (Usuario autenticado)
   */
  @Get('profile')
  @UseGuards(JwtUserAuthGuard)
  async getProfile(@Req() req) {
    const userId = req.user?.id;
    return this.usersService.findOne(userId);
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * @route PATCH /users/profile
   * @access Private (Usuario autenticado)
   */
  @Patch('profile')
  @UseGuards(JwtUserAuthGuard)
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user?.id;
    
    // No permitir cambio de rol desde este endpoint
    const { roleId, ...safeUpdateDto } = updateUserDto;
    
    return this.usersService.update(userId, safeUpdateDto);
  }

  /**
   * Obtiene los pedidos del usuario autenticado
   * @route GET /users/orders
   * @access Private (Usuario autenticado)
   */
  @Get('orders')
  @UseGuards(JwtUserAuthGuard)
  async getUserOrders(@Req() req) {
    const userId = req.user?.id;
    return this.usersService.getUserOrders(userId);
  }

  /**
   * Obtiene todos los usuarios activos
   * Solo administradores y vendedores pueden ver todos los usuarios
   * 
   * @route GET /users
   * @access Private (Administrador, Vendedor)
   */
  @Get()
  @UseGuards(JwtUserAuthGuard)
  async findAll(@Req() req) {
    const userRole = req.user?.role?.name?.toLowerCase();

    // Solo admin y vendedor pueden ver todos los usuarios
    if (!userRole || !['administrador', 'vendedor'].includes(userRole)) {
      throw new ForbiddenException(
        'No tienes permisos para ver todos los usuarios'
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
  @UseGuards(JwtUserAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userId = req.user?.id;
    const userRole = req.user?.role?.name?.toLowerCase();

    // Admin y vendedor pueden ver cualquier usuario
    if (userRole === 'administrador' || userRole === 'vendedor') {
      return this.usersService.findOne(id);
    }

    // Usuarios normales solo pueden ver su propia información
    if (userId !== id) {
      throw new ForbiddenException(
        'Solo puedes ver tu propia información'
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
  @UseGuards(JwtUserAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role?.name?.toLowerCase();

    // Si no es administrador y intenta cambiar el rol, denegar
    if (updateUserDto.roleId && userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden cambiar roles de usuario'
      );
    }

    // Admin puede actualizar cualquier usuario
    if (userRole === 'administrador') {
      return this.usersService.update(id, updateUserDto);
    }

    // Usuarios normales solo pueden actualizar su propia información
    if (userId !== id) {
      throw new ForbiddenException(
        'Solo puedes actualizar tu propia información'
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
  @UseGuards(JwtUserAuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userRole = req.user?.role?.name?.toLowerCase();

    // Solo administradores pueden desactivar usuarios
    if (userRole !== 'administrador') {
      throw new ForbiddenException(
        'Solo administradores pueden desactivar usuarios'
      );
    }

    return this.usersService.remove(id);
  }
}