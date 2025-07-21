import { ApiProperty } from '@nestjs/swagger';
import { SeoMeta } from '.prisma/client';

export class SeoMetaEntity {
  @ApiProperty({
    description: 'SEO 標題',
  })
  title?: string;

  @ApiProperty({
    description: 'SEO 描述',
  })
  description?: string;

  @ApiProperty({
    description: '商店轮播图',
  })
  images?: { url: string; href?: string }[];

  constructor(item: SeoMeta) {
    this.title = item.title;
    this.description = item.description;
    this.images = item.images as { url: string; href: string }[];
  }
}
