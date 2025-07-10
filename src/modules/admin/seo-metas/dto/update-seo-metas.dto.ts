import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class UpdateSeoMetasDto {
  @ApiProperty({
    description: 'SEO 標題',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'SEO 描述',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '商店轮播图',
    type: [Object],
    example: [
      { url: 'https://example.com/image.jpg', href: 'https://example.com' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarouselImageDto)
  images?: CarouselImageDto[] = [];
}

export class CarouselImageDto {
  @ApiProperty({
    description: '图片URL',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: '跳转链接',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  href?: string;
}
