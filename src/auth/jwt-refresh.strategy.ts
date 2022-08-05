import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const header = request?.headers?.refresh;
          if (header && !Array.isArray(header)) return header;
          return null;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: { email: string }) {
    const refreshToken = this.refreshFromRequest(request);
    // Non-null assertion because validate function is called only if jwtFromRequest
    // function returns something. So we can be sure that token is there.
    return this.userService.getUserByRefreshToken(refreshToken!, payload.email);
  }
  private refreshFromRequest(req: Request): string | null {
    const header = req?.headers?.refresh;
    if (header && !Array.isArray(header)) return header;
    return null;
  }
}
