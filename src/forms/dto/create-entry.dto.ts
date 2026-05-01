import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateEntryDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  order?: number;
}