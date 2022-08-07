import { IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiBody } from '@nestjs/swagger';
export class CreateTagDto {
  @MaxLength(40)
  @ApiProperty()
  name: string;
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  sortOrder?: number;
}
