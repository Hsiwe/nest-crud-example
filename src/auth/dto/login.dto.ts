import { IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiBody, PartialType } from '@nestjs/swagger';
export class LoginDTO {
  @IsString()
  @ApiProperty()
  email: string;
  @IsString()
  @ApiProperty()
  password: string;
}
