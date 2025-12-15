import { IsObject, IsOptional } from 'class-validator';

export class UpdateEntryDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}