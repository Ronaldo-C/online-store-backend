import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { IsBigInt } from 'src/utils/custom-validators/isBigInt';
import { BigIntTransform } from 'src/utils/transforms/bigint';

export class UpdatePasswordDto {
  @Transform(BigIntTransform)
  @IsBigInt()
  userId: bigint;

  @IsNotEmpty()
  @IsString()
  @Min(8)
  @Max(20)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Min(8)
  @Max(20)
  updatedPassword: string;
}
