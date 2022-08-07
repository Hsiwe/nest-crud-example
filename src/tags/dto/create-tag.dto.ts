import { IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
  @MaxLength(40)
  name: string;
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
