import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { IHashService } from 'src/hash.service';
import { PrismaService } from 'src/prisma.service';
import { RegisterDTO, UpdateDTO } from './register.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(IHashService) private hashService: IHashService,
  ) {}
  async findOneByCredentials(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (user) {
      const samePass = await this.hashService.compare(password, user.password);
      if (samePass) return user;
    }
    return null;
  }
  async findOneByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }
  async findUserWithRefreshToken(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { RefreshToken: true },
    });
    return user;
  }
  async create(dto: RegisterDTO): Promise<User> {
    const { email, password, nickname } = dto;
    const hPwd = await this.hashService.hash(password);
    return this.prisma.user.create({
      data: { email, nickname, password: hPwd },
    });
  }
  async getUserByRefreshToken(token: string, email: string) {
    const user = await this.findUserWithRefreshToken(email);
    if (!user || !user.RefreshToken?.tokenHash) return null;
    const isTokenMatches = await this.hashService.compare(
      token,
      user.RefreshToken?.tokenHash,
    );
    if (isTokenMatches) return user;
  }
  async setRefreshToken(email: string, token: string) {
    const user = await this.findOneByEmail(email);
    if (!user) return;
    const tokenHash = await this.hashService.hash(token);
    // Using deleteMany even though there's only one refresh token(one-to-one rel) because
    // delete operation requires record to actually exist which is not always the
    // case(refresh token can be nonexistent).
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId: user.id },
    });
  }
  async removeRefreshToken(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: { RefreshToken: { delete: true } },
    });
  }
  async getUserWithTags(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      select: {
        email: true,
        nickname: true,
        tags: { select: { id: true, name: true, sortOrder: true } },
      },
    });
  }
  async checkUpdateUniqueness(params: UpdateDTO): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: params.email,
            nickname: params.nickname,
          },
        ],
      },
    });
    return !user;
  }
  async updateUser(email: string, dto: UpdateDTO) {
    let password = dto.password;
    if (password) password = await this.hashService.hash(password);
    const user = await this.prisma.user.findFirstOrThrow({ where: { email } });
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { email: dto?.email, password, nickname: dto?.nickname },
    });
    return { nickname: updated.nickname, email: updated.email };
  }
  async delete(email: string) {
    await this.prisma.user.delete({ where: { email } });
  }
  async connectTags(email: string, tagIds: number[]) {
    const tags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true, name: true, sortOrder: true },
    });
    if (tags.length !== tagIds.length) return;
    const user = await this.prisma.user.findFirstOrThrow({ where: { email } });
    await this.prisma.tag.updateMany({
      where: { id: { in: tagIds } },
      data: { creator: { set: user.id } },
    });
    return tags;
  }
  async getMyTags(email: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { email },
      include: { tags: { select: { id: true, name: true, sortOrder: true } } },
    });
    return user.tags;
  }
}
