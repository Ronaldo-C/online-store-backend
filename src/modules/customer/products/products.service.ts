import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisKey } from 'src/constants/redisKey';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ListProductDto } from './dto/list-product.dto';
import { paginateData } from 'src/typeDefs/list-dto';
import { ProductEntity } from './entities/product.entity';
import { drop, take } from 'lodash';
import { ERROR_NOTFOUND_MESSAGE_CODE } from 'src/typeDefs/error-code';
import { CacheService } from 'src/shared/cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaService: PrismaService,
  ) {}

  async getProductList(dto: ListProductDto) {
    const productList = await this.cacheService.get(RedisKey.productList);

    if (productList) {
      return this.resolverWithPagination(dto, JSON.parse(productList));
    }

    const products = await this.prismaService.product.findMany({
      where: {
        deletedAt: null,
        shelfStatus: true,
      },
      orderBy: {
        id: 'desc',
      },
      include: {
        skus: {
          where: {
            deletedAt: null,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    await this.cacheService.set(
      RedisKey.productList,
      JSON.stringify(products.map((item) => new ProductEntity(item))),
    );

    return this.resolverWithPagination(
      dto,
      products.map((item) => new ProductEntity(item)),
    );
  }

  async getProductDetail(id: bigint) {
    const product = await this.cacheService.get(RedisKey.productDetail(id));

    if (product) {
      return new ProductEntity(JSON.parse(product));
    }

    const productDetail = await this.prismaService.product.findUnique({
      where: {
        id,
      },
      include: {
        skus: {
          where: {
            deletedAt: null,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!productDetail) {
      throw new NotFoundException(ERROR_NOTFOUND_MESSAGE_CODE.NOT_FOUND);
    }

    await this.cacheService.set(
      RedisKey.productDetail(id),
      JSON.stringify(new ProductEntity(productDetail)),
    );

    return new ProductEntity(productDetail);
  }

  private resolverWithPagination(dto: ListProductDto, data: ProductEntity[]) {
    const { page, size, search, isAll, categoryIds } = dto;

    if (search) {
      data = data.filter((item) =>
        item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
      );
    }

    if (categoryIds) {
      data = data.filter((item) =>
        item.categories.some((category) =>
          categoryIds.map(Number).includes(Number(category.id)),
        ),
      );
    }

    const total = data.length;

    if (isAll) {
      return paginateData(data, total, page, size);
    }

    return paginateData(
      take(drop(data, size * (page - 1)), size),
      total,
      page,
      size,
    );
  }
}
