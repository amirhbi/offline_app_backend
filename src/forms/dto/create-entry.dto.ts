import { IsObject, IsOptional } from 'class-validator';

export class CreateEntryDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}