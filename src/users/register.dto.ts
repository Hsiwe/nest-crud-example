import { Matches, MaxLength } from 'class-validator';

export class RegisterDTO {
  @MaxLength(100)
  email: string;
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}/, {
    message: 'Password is too weak',
  })
  password: string;

  @MaxLength(30)
  nickname: string;
}
