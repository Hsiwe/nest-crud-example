import { Module } from '@nestjs/common';
import { BcryptHashingService, IHashService } from 'src/hash.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    UsersService,
    PrismaService,
    {
      provide: IHashService,
      useClass: BcryptHashingService,
    },
    AuthService,
    JwtService,
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
