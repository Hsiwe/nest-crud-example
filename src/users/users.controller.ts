import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TagsService } from 'src/tags/tags.service';
import { UserAddTagsDTO } from './add-tags.dto';
import { UpdateDTO } from './register.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private usersService: UsersService,
    private tagsService: TagsService,
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
      const isUnique = await this.usersService.checkUpdateUniqueness(updateDTO);
      if (!isUnique)
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
  @UseGuards(JwtAuthGuard)
  @Post('/tag')
  async addTags(@Req() req, @Body() body: UserAddTagsDTO) {
    return this.usersService.connectTags(req.user.email, body.tags);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/tag/:id')
  async deleteTag(@Req() req, @Param('id') id: string) {
    const user = await this.usersService.findOneByEmail(req.user.email);
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    await this.tagsService.remove(+id);
    return this.usersService.getMyTags(req.user.email);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/tag/my')
  async getMyTag(@Req() req) {
    const user = await this.usersService.findOneByEmail(req.user.email);
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    return this.usersService.getMyTags(req.user.email);
  }
}
