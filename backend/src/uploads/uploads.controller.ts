import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readdirSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  // Configurar Multer
  private storage = diskStorage({
    destination: './uploads', // Carpeta donde se guardan
    filename: (req, file, callback) => {
      // Generar nombre único: timestamp-random-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  });

  // Validar tipo de archivo
  private fileFilter = (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          'Solo se permiten imágenes (jpg, jpeg, png, webp)',
        ),
        false,
      );
    }
  };

  /**
   * Subir una imagen
   * POST /uploads
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Retornar la URL completa de la imagen
    const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/images/${file.filename}`;

    return {
      message: 'Imagen subida correctamente',
      filename: file.filename,
      url: imageUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Listar todas las imágenes subidas
   * GET /uploads
   */
  @Get()
  getAllFiles() {
    const uploadPath = join(__dirname, '..', '..', 'uploads');
    const files = readdirSync(uploadPath);
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return files.map((filename) => ({
      filename,
      url: `${baseUrl}/images/${filename}`,
    }));
  }
}