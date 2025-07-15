import { Injectable } from '@nestjs/common';
import { RedisKey } from 'src/constants/redisKey';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SeoMetaEntity } from './entities/seo-metas.entity';
import { CacheService } from 'src/shared/cache/cache.service';

@Injectable()
export class SeoMetasService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaService: PrismaService,
  ) {}

  async getSeoMetas() {
    const seoMeta = await this.cacheService.get(RedisKey.seoMeta);

    if (seoMeta) {
      return JSON.parse(seoMeta);
    }

    const seoMetas = await this.prismaService.seoMeta.findFirst();

    await this.cacheService.set(
      RedisKey.seoMeta,
      JSON.stringify(new SeoMetaEntity(seoMetas)),
    );

    return new SeoMetaEntity(seoMetas);
  }
}
