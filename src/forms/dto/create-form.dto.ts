import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FieldDto } from './field.dto.js';
import { CategoryDto } from './category.dto.js';

export class CreateFormDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields?: FieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  subFields?: FieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];

  @IsOptional()
  @IsString()
  pdfDescription?: string;

  @IsOptional()
  @IsString()
  pdfImage?: string;

  @IsOptional()
  @IsBoolean()
  hasSubFields?: boolean;
}