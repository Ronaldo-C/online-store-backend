import { Injectable } from '@nestjs/common';
import { RedisKey } from 'src/constants/redisKey';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductCategoryEntity } from './entities/product-categories.entity';
import { CacheService } from 'src/shared/cache/cache.service';

@Injectable()
export class ProductCategoriesService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaService: PrismaService,
  ) {}

  async getProductCategoryList() {
    const productCategoryList = await this.cacheService.get(
      RedisKey.productCategoryList,
    );

    if (productCategoryList) {
      return JSON.parse(productCategoryList);
    }

    const productCategoryListFromDB =
      await this.prismaService.productCategory.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          id: 'desc',
        },
      });

    const productCategoryListFromDBWithEntity = productCategoryListFromDB.map(
      (item) => new ProductCategoryEntity(item),
    );

    await this.cacheService.set(
      RedisKey.productCategoryList,
      JSON.stringify(productCategoryListFromDBWithEntity),
    );

    return productCategoryListFromDBWithEntity;
  }
}
