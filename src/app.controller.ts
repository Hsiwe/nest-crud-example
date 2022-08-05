import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import JwtRefreshGuard from './auth/refresh.guard';
import { RegisterDTO } from './users/register.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('signin')
  async register(@Body() registerDTO: RegisterDTO) {
    try {
      const prevUser = await this.usersService.findOneByEmail(
        registerDTO.email,
      );
      if (prevUser) throw new HttpException('Email already in use', 400);

      const res = await this.authService.register(registerDTO);
      await this.usersService.setRefreshToken(
        registerDTO.email,
        res.refresh_token.token,
      );
      return res;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error while registering user', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      const res = this.authService.login(req.body);
      await this.usersService.setRefreshToken(
        req.user.email,
        res.refresh_token.token,
      );
      return res;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error in login', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@Req() req) {
    try {
      await this.authService.logout(req.user.email);
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error in logout', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req) {
    try {
      return this.authService.getJWTAccessToken(req.user.email);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error while refreshing token', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
