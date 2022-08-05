import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateDTO } from './register.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('')
  async showMe(@Request() req) {
    try {
      const user: { email: string } = req.user;
      return this.usersService.getUserWithTags(user.email);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error in user showMe', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put('')
  async update(@Body() updateDTO: UpdateDTO, @Req() req) {
    try {
      const unique = await this.usersService.checkUpdateUniqueness(updateDTO);
      if (!unique)
        throw new HttpException(
          'Email or nickname is not unique',
          HttpStatus.BAD_REQUEST,
        );

      return this.usersService.updateUser(req.user.email, updateDTO);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error in user update', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Delete('')
  async delete(@Req() req) {
    try {
      const email = req.user.email;
      await this.authService.logout(email);
      await this.usersService.delete(email);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error in user delete', error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
