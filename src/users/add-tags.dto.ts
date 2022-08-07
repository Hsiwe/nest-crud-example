import { IsNumber } from 'class-validator';

export class UserAddTagsDTO {
  @IsNumber({}, { each: true })
  tags: number[];
}
