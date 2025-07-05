import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsBigInt } from 'src/utils/custom-validators/isBigInt';
import { BigIntTransform } from 'src/utils/transforms/bigint';

export class UpdatePasswordDto {
  @Transform(BigIntTransform)
  @IsBigInt()
  userId: bigint;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  updatedPassword: string;
}
