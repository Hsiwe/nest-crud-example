import { Module } from '@nestjs/common';
import { BcryptHashingService, IHashService } from 'src/hash.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    PrismaService,
    {
      provide: IHashService,
      useClass: BcryptHashingService,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
