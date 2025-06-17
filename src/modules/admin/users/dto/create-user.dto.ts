import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: '用户名',
    type: String,
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  name: string;

  @ApiProperty({
    description: '邮箱',
    required: false,
    type: String,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '邮箱',
    enum: $Enums.UserRole,
  })
  @IsEnum($Enums.UserRole)
  userRole: $Enums.UserRole;
}
