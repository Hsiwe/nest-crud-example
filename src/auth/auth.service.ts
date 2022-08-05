import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDTO } from 'src/users/register.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async validateLocal(email: string, pass: string) {
    const user = await this.usersService.findOneByCredentials(email, pass);
    if (!user) return null;

    const { password, ...result } = user;
    return result;
  }
  async validateJWT(username: string) {
    const user = await this.usersService.findOneByEmail(username);
    if (!user) return null;

    const { password, ...result } = user;
    return result;
  }
  login(user: { email: string }) {
    const access_token = this.getJWTAccessToken(user.email);
    const refresh_token = this.getJWTRefreshToken(user.email);
    return {
      ...access_token,
      refresh_token,
    };
  }
  async register(user: RegisterDTO) {
    await this.usersService.create(user);
    const refresh_token = this.getJWTRefreshToken(user.email);
    return {
      expire: this.config.getOrThrow('JWT_EXPIRATION'),
      token: this.jwtService.sign({
        username: user.email,
      }),
      refresh_token,
    };
  }
  getJWTRefreshToken(email: string): {
    token: string;
    expire: any;
  } {
    return {
      expire: this.config.getOrThrow('JWT_REFRESH_EXPIRATION'),
      token: this.jwtService.sign(
        { email },
        {
          secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
          expiresIn: `${this.config.getOrThrow('JWT_REFRESH_EXPIRATION')}s`,
        },
      ),
    };
  }
  getJWTAccessToken(email: string): {
    token: string;
    expire: any;
  } {
    return {
      expire: this.config.getOrThrow('JWT_EXPIRATION'),
      token: this.jwtService.sign({ email }),
    };
  }
}
