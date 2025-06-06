import { Transform } from 'class-transformer';
import { IsBigInt } from 'src/utils/custom-validators/isBigInt';
import { BigIntTransform } from 'src/utils/transforms/bigint';

export class ResetPasswordDto {
  @Transform(BigIntTransform)
  @IsBigInt()
  userId: bigint;
}
