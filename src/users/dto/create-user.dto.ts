import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsString()
  @IsIn(['l2', 'l3'])
  role!: 'l2' | 'l3';

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  forms?: string[];

  @IsOptional()
  @IsArray()
  forms_view?: string[];

  @IsOptional()
  @IsArray()
  reports?: string[];

  @IsOptional()
  @IsArray()
  logs?: string[];

  @IsOptional()
  @IsBoolean()
  backupAllowed?: boolean;
}