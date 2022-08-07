import { Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiBody, PartialType } from '@nestjs/swagger';
export class RegisterDTO {
  @MaxLength(100)
  @ApiProperty()
  email: string;
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}/, {
    message: 'Password is too weak',
  })
  @ApiProperty()
  password: string;

  @MaxLength(30)
  @ApiProperty()
  nickname: string;
}
export class UpdateDTO extends PartialType(RegisterDTO) {}
