import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Query,
  Put,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('tag')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTagDto: CreateTagDto, @Req() req) {
    const user = await this.usersService.findOneByEmail(req.user.email);
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    const isUnique = await this.tagsService.checkCreateUniqueness(createTagDto);
    if (!isUnique)
      throw new HttpException('Name not unique', HttpStatus.BAD_REQUEST);

    return this.tagsService.stripUser(
      await this.tagsService.create(user, createTagDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('length') limit: string,
    @Query('offset') offset: string,
    @Query('sortByOrder') byOrder,
    @Query('sortByName') byName,
    @Query('sortOrder') sortOrder?: string,
  ) {
    if (typeof byOrder === 'string') byOrder = true;
    if (typeof byName === 'string') byName = true;
    const data = await this.tagsService.findAll({
      limit,
      offset,
      byName,
      byOrder,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    });
    return { data, meta: { quantity: data.length, length: limit, offset } };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tag = await this.tagsService.findOne(+id);
    if (!tag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
    return tag;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() req,
  ) {
    const user = await this.usersService.findOneByEmail(req.user.email);
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    const canEdit = await this.tagsService.canEdit(user.email, +id);
    if (!canEdit) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return this.tagsService.update(+id, updateTagDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const user = await this.usersService.findOneByEmail(req.user.email);
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    const canEdit = await this.tagsService.canEdit(user.email, +id);
    if (!canEdit) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return this.tagsService.remove(+id);
  }
}
