import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { join } from 'path';
import { readdirSync } from 'fs';


@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  create(@Body() createUploadDto: CreateUploadDto) {
    return this.uploadsService.create(createUploadDto);
  }

  @Get()
  getAllFiles() {
    const uploadPath = join(__dirname, '..', '..', 'uploads'); // <- cuidado con la ruta
    const files = readdirSync(uploadPath);
    return files; // ["imagen1.jpg", "imagen2.jpg"]
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(id, updateUploadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(id);
  }
}
