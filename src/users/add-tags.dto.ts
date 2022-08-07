import { IsNumber } from 'class-validator';
import { ApiProperty, ApiBody } from '@nestjs/swagger';
export class UserAddTagsDTO {
  @IsNumber({}, { each: true })
  @ApiProperty()
  tags: number[];
}
