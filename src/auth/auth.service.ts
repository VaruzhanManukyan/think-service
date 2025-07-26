import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import * as argon2 from 'argon2';
import type Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAuthDto, RegisterAuthDto, LogoutAuthDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt.interface';
import { isDev } from 'src/utils/is-dev.util';

@Injectable()
export class AuthService {
  private readonly COOKIE_DOMAIN: string;
  private readonly JWT_ACCESS_EXPIRES_IN: string;
  private readonly JWT_ACCESS_TOKEN_SECRET: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;
  private readonly JWT_REFRESH_TOKEN_SECRET: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.JWT_ACCESS_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');
    this.JWT_ACCESS_TOKEN_SECRET = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');
    this.JWT_REFRESH_EXPIRES_IN = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    this.JWT_REFRESH_TOKEN_SECRET = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET');
  }

  private async validateUser(dto: LoginAuthDto) {
    const { email, number, password } = dto;
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        number
      },
      include: { 
        role: true 
      } 
    });
    if (!user) return null;

    const isMatch = await argon2.verify(user.password, password);
    return isMatch ? user : null;
  }

  private generateTokens(sub: string, role: string) {
    const payload: JwtPayload = {
      sub,
      role
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: this.JWT_ACCESS_EXPIRES_IN
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: this.JWT_REFRESH_EXPIRES_IN
    });
    return { accessToken, refreshToken };
  }

  private setCookie(response: Response, refreshToken: string) {
    const expires = new Date(Date.now() + ms(this.JWT_REFRESH_EXPIRES_IN));
      response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
      expires,
    });
  }

  private async auth(response: Response, payload: JwtPayload) {
    const { accessToken, refreshToken } = this.generateTokens(payload.sub, payload.role);
    await this.redis.set(
      `user:${payload.sub}:refresh`, 
      refreshToken, 
      'EX', 
      parseInt(this.JWT_REFRESH_EXPIRES_IN)
    );
    this.setCookie(response, refreshToken);
    return { accessToken };
  }

  async register(response: Response, dto: RegisterAuthDto) {
    const exists = await this.prismaService.user.findFirst({
      where: { OR: [{ email: dto.email }, { number: dto.number }] },
    });
    if (exists) {
      throw new ConflictException('Email or phone number already in use');
    }

    const hash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 10,
      parallelism: 1,
    });

    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        number: dto.number,
        password: hash,
        role: { connect: { name: dto.role } },
      },
    });

    return this.login(response, { email: user.email, number: user.number, password: dto.password });
  }

  async login(response: Response, dto: LoginAuthDto) {
    const user = await this.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role.name
    };

    return await this.auth(response, payload);
  }

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies['refreshToken'];
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.redis.get(`user:${payload.sub}:refresh`);
    if (stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    return await this.auth(response, payload);
  }

  async logout(response: Response, dto: LogoutAuthDto) {
    const key = `user:${dto.userId}:refresh`;
    const deleted = await this.redis.del(key);
    response.clearCookie('refreshToken');
    if (!deleted) {
      throw new UnauthorizedException('No active session found');
    }
    return { success: true };
  }
}