import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsString()
  @IsIn(['admin', 'l3'])
  role!: 'admin' | 'l3';

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