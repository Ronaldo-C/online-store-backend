import { $Enums } from '@prisma/client';

import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum($Enums.UserRole)
  userRole: $Enums.UserRole;
}
