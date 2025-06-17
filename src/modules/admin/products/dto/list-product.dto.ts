import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';
import { ListWithSearchDto } from 'src/typeDefs/list-dto';
import { IsBigInt } from 'src/utils/custom-validators/isBigInt';
import { BigIntTransform } from 'src/utils/transforms/bigint';
import { StrSplitByCommaTransform } from 'src/utils/transforms/strSplitByComma';

export class ListProductDto extends ListWithSearchDto {
  @Transform(StrSplitByCommaTransform)
  @Transform(BigIntTransform)
  @IsArray()
  @IsBigInt({ each: true })
  @IsOptional()
  categoryIds?: bigint[];
}
