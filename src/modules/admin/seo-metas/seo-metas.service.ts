import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SeoMetaEntity } from './entities/seo-metas.entity';
import { UpdateSeoMetasDto } from './dto/update-seo-metas.dto';
import { REQUEST } from '@nestjs/core';
import { TRequest } from 'src/typeDefs/request';

@Injectable()
export class SeoMetasService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: TRequest,
  ) {}

  async detail() {
    const item = await this.prisma.seoMeta.findFirst();
    return new SeoMetaEntity(item);
  }

  async update(dto: UpdateSeoMetasDto) {
    const item = await this.prisma.seoMeta.findFirst();
    if (!item) {
      const seoMeta = await this.prisma.seoMeta.create({
        data: {
          title: dto.title,
          description: dto.description,
          images: dto.images?.map((img) => ({ ...img })),
          operatedBy: this.request.user.id,
        },
      });
      return new SeoMetaEntity(seoMeta);
    }
    const updatedItem = await this.prisma.seoMeta.update({
      where: {
        id: item.id,
      },
      data: {
        title: dto.title ?? item.title,
        description: dto.description ?? item.description,
        images: dto.images
          ? dto.images.map((img) => ({ ...img }))
          : item.images,
        operatedBy: this.request.user.id,
      },
    });
    return new SeoMetaEntity(updatedItem);
  }
}
