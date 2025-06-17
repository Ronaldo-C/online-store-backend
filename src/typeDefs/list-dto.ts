import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BooleanTransform } from 'src/utils/transforms/boolean';
import { SortTransform } from 'src/utils/transforms/sort';

export class ListDto {
  @ApiProperty({
    example: 1,
    description: '分页页码，默认为1',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: '分页数量，默认为10',
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @ApiProperty({
    example: 'id:desc',
    description: '排序，默认为id:desc',
    required: false,
    type: String,
    default: 'id:desc',
  })
  @IsOptional()
  @Transform(SortTransform)
  sort?: object[] = [{ id: 'desc' }];

  @ApiProperty({
    example: false,
    description: '是否获取全部数据，部分接口支持',
    required: false,
    type: Boolean,
    default: false,
  })
  @Transform(BooleanTransform)
  @IsBoolean()
  @IsOptional()
  isAll?: boolean;
}

export class ListWithSearchDto extends ListDto {
  @ApiProperty({
    description: '搜索',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: '数组',
    isArray: true,
    type: Object,
  })
  list: T[];

  @ApiProperty({
    description: '总数',
    example: 100,
  })
  total?: number;

  @ApiProperty({
    description: '总页数',
    example: 10,
  })
  totalPage?: number;

  @ApiProperty({
    description: '当前页数',
    example: 1,
  })
  currentPage?: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  size?: number;
}

export function paginateData<T>(
  data: T[],
  total: number,
  page: number,
  size: number,
  extra?: Record<string, any>,
): PaginatedResponseDto<T> {
  return {
    list: data,
    total,
    totalPage: Math.ceil(total / size),
    currentPage: page,
    size,
    ...extra,
  };
}
