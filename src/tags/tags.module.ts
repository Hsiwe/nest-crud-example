import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { BcryptHashingService, IHashService } from 'src/hash.service';

@Module({
  controllers: [TagsController],
  providers: [
    TagsService,
    UsersService,
    PrismaService,
    {
      provide: IHashService,
      useClass: BcryptHashingService,
    },
  ],
})
export class TagsModule {}
