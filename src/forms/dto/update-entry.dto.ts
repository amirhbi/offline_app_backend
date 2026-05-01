import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class UpdateEntryDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  order?: number;
}