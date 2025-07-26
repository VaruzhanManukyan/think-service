import { Controller, Post, Body, Res, HttpStatus, HttpCode, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginAuthDto, LogoutAuthDto, RegisterAuthDto } from './dto/auth.dto';
import { Authorization } from './decorators/authorization.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Res({ passthrough: true }) response: Response, @Body() dto: RegisterAuthDto) {
    return this.authService.register(response, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Res({ passthrough: true }) response: Response, @Body() dto: LoginAuthDto) {
    return this.authService.login(response, dto);
  }
  
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.refresh(request, response);
  }

  @Post('logout')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response, @Body() dto: LogoutAuthDto) {
    return this.authService.logout(response, dto);
  }
}
