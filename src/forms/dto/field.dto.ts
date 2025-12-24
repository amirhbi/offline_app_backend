import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldDto {
  @IsString()
  label!: string;

  @IsString()
  @IsIn(['text', 'number', 'date', 'select', 'checkbox', 'lookup'])
  type!: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'lookup';

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  options?: string[];

  @IsOptional()
  @IsString()
  lookupFormId?: string;

  @IsOptional()
  @IsString()
  lookupSourceField?: string;
}