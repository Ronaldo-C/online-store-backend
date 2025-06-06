import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsBigInt } from 'src/utils/custom-validators/isBigInt';
import { BigIntTransform } from 'src/utils/transforms/bigint';
import { BooleanTransform } from 'src/utils/transforms/boolean';
import { NumberTransform } from 'src/utils/transforms/number';

export class CreateProductSkuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(NumberTransform)
  @IsNumber()
  costPrice: number;

  @Transform(NumberTransform)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @Transform(BooleanTransform)
  @IsBoolean()
  shelfStatus: boolean;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  @IsString({ each: true })
  pictures?: string[];

  @IsObject()
  @IsOptional()
  description?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSkuDto)
  skus: CreateProductSkuDto[];

  @IsArray()
  @Transform(BigIntTransform)
  @IsBigInt({ each: true })
  @IsOptional()
  categoryIds?: bigint[];
}
