import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BooleanTransform } from 'src/utils/transforms/boolean';
import { SortTransform } from 'src/utils/transforms/sort';

export class ListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @IsOptional()
  @Transform(SortTransform)
  sort?: object[] = [{ id: 'desc' }];

  @Transform(BooleanTransform)
  @IsBoolean()
  @IsOptional()
  isAll?: boolean;
}

export class PaginatedResponseDto<T> {
  list: T[];
  total?: number;
  totalPage?: number;
  currentPage?: number;
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
