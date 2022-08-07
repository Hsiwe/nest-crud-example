import { Injectable } from '@nestjs/common';
import { Prisma, Tag, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}
  stripUser(t: Tag) {
    return { id: t.id, name: t.name, sortOrder: t.sortOrder };
  }
  async create(user: User, dto: CreateTagDto) {
    return this.prisma.tag.create({
      data: { name: dto.name, sortOrder: dto.sortOrder, creator: user.id },
    });
  }
  async checkCreateUniqueness(params: CreateTagDto): Promise<boolean> {
    const tag = await this.prisma.tag.findFirst({
      where: {
        name: params.name,
      },
    });
    return !tag;
  }
  async findAll(params: {
    limit?: string;
    offset?: string;
    byName?: boolean;
    byOrder?: boolean;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { limit, offset, byName, byOrder, sortOrder } = params;
    const order = sortOrder ?? 'asc';
    let orderObj: Prisma.Enumerable<Prisma.TagOrderByWithRelationInput> = {
      id: order,
    };
    if (byOrder) orderObj = { sortOrder: order };
    if (byName) orderObj = { name: order };
    return this.prisma.tag.findMany({
      orderBy: orderObj,
      take: limit ? Number(limit) : 10,
      skip: offset ? Number(offset) : 0,
    });
  }

  async findOne(id: number) {
    return this.prisma.tag.findFirst({
      where: { id },
      select: {
        user: { select: { nickname: true, id: true } },
        name: true,
        sortOrder: true,
      },
    });
  }

  async update(id: number, dto: UpdateTagDto) {
    const updated = await this.prisma.tag.update({
      where: { id },
      data: { name: dto.name, sortOrder: dto.sortOrder },
      select: {
        user: { select: { nickname: true, id: true } },
        name: true,
        sortOrder: true,
      },
    });
    return updated;
  }
  async canEdit(userEmail: string, tagId: number) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { email: userEmail },
      include: { tags: true },
    });
    return !!user.tags.find((t) => t.id === tagId);
  }

  async remove(id: number) {
    await this.prisma.tag.delete({ where: { id } });
  }
}
