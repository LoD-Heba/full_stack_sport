import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, LoginResponse, UserProfile } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.findUserForAuthentication(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User): LoginResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.getTokenExpirationInSeconds();

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      role: user.role?.name ?? 'Cliente',
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: userProfile,
    };
  }

  /**
   * Obtiene el tiempo de expiración del token en segundos
   * Soporta formatos como '3600', '60s', '10m', '2h', '1d'
   * Por defecto, retorna 3600 segundos (1 hora) si no se especifica o si el formato es inválido
   */
  private getTokenExpirationInSeconds(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');

    // Si ya es un número puro, devolverlo
    const numericValue = parseInt(expiresIn, 10);
    if (!isNaN(numericValue) && expiresIn === numericValue.toString()) {
      return numericValue;
    }

    // Manejar formatos de tiempo
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1), 10);
      return !isNaN(days) ? days * 86400 : 3600;
    }

    if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1), 10);
      return !isNaN(hours) ? hours * 3600 : 3600;
    }

    if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn.slice(0, -1), 10);
      return !isNaN(minutes) ? minutes * 60 : 3600;
    }

    if (expiresIn.endsWith('s')) {
      const seconds = parseInt(expiresIn.slice(0, -1), 10);
      return !isNaN(seconds) ? seconds : 3600;
    }

    // Por defecto, 1 hora
    return 3600;
  }

  /**
   * Encuentra un usuario activo con su correo electrónico
   */
  private async findUserForAuthentication(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isActive: true },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
      },
      relations: ['role'],
    });
  }
}