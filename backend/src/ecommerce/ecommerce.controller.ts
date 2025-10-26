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
} from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { CreateEcommerceDto } from './dto/create-ecommerce.dto';
import { UpdateEcommerceDto } from './dto/update-ecommerce.dto';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  @Post()
  @UseGuards(JwtUserAuthGuard) // Proteger endpoint
  create(@Body() createEcommerceDto: CreateEcommerceDto, @Req() req) {
    const vendorId = req.user.id; // Usuario autenticado = vendedor
    return this.ecommerceService.create(createEcommerceDto, vendorId);
  }

  @Get('my-orders')
  @UseGuards(JwtUserAuthGuard) // Ya cambiado antes
  async findMyOrders(@Req() req) {
    const userId = req.user.id;
    return this.ecommerceService.findByUser(userId); // Método renombrado
  }

  @Get()
  findAll() {
    return this.ecommerceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ecommerceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEcommerceDto: UpdateEcommerceDto,
  ) {
    return this.ecommerceService.update(id, updateEcommerceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ecommerceService.remove(id);
  }
}
