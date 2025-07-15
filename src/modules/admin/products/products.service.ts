import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TRequest } from 'src/typeDefs/request';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ERROR_BAD_REQUEST_MESSAGE_CODE,
  ERROR_CONFLICT_MESSAGE_CODE,
  ERROR_NOTFOUND_MESSAGE_CODE,
} from 'src/typeDefs/error-code';
import { UpdateProductDto } from './dto/update-product.dto';
import { isEmpty } from 'lodash';
import { Prisma } from '@prisma/client';
import { paginateData } from 'src/typeDefs/list-dto';
import { ListProductDto } from './dto/list-product.dto';
import { CacheService } from 'src/shared/cache/cache.service';
import { RedisKey } from 'src/constants/redisKey';

@Injectable()
export class ProductsService {
  constructor(
    private readonly cacheService: CacheService,
    @Inject(REQUEST) private readonly request: TRequest,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateProductDto) {
    await this.validateParams(dto);

    if (isEmpty(dto.skus)) {
      throw new BadRequestException(
        `skus|${ERROR_BAD_REQUEST_MESSAGE_CODE.EMPTY_ARRAY}`,
      );
    }

    if (isEmpty(dto.categoryIds)) {
      throw new BadRequestException(
        `categories|${ERROR_BAD_REQUEST_MESSAGE_CODE.EMPTY_ARRAY}`,
      );
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        number: dto.number,
        shelfStatus: dto.shelfStatus,
        thumbnail: dto.thumbnail,
        pictures: dto.pictures,
        description: dto.description,
        categories:
          dto.categoryIds && dto.categoryIds.length > 0
            ? {
                connect: dto.categoryIds.map((id) => ({ id })),
              }
            : undefined,
        skus: {
          createMany: {
            data: dto.skus.map((sku) => ({
              name: sku.name,
              costPrice: sku.costPrice,
              price: sku.price,
              stock: sku.stock,
              operatedBy: this.request.user.id,
            })),
          },
        },
        operatedBy: this.request.user.id,
      },
    });

    this.cacheService.del(RedisKey.productDetail(product.id));
    this.cacheService.del(RedisKey.productList);

    return this.detail(product.id);
  }

  async update(id: bigint, dto: UpdateProductDto) {
    await this.validateParams(dto, id);

    const product = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          name: dto.name,
          number: dto.number,
          shelfStatus: dto.shelfStatus,
          thumbnail: dto.thumbnail,
          pictures: dto.pictures,
          description: dto.description,
          categories:
            dto.categoryIds && dto.categoryIds.length > 0
              ? {
                  connect: dto.categoryIds.map((id) => ({ id })),
                }
              : undefined,
          operatedBy: this.request.user.id,
        },
      });
      if (dto.skus && dto.skus.length > 0) {
        await tx.productSku.updateMany({
          where: {
            productId: id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
        await tx.product.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            skus: {
              createMany: {
                data: dto.skus.map((sku) => ({
                  name: sku.name,
                  costPrice: sku.costPrice,
                  price: sku.price,
                  stock: sku.stock,
                  operatedBy: this.request.user.id,
                })),
              },
            },
          },
        });
      }

      return product;
    });

    this.cacheService.del(RedisKey.productDetail(product.id));
    this.cacheService.del(RedisKey.productList);

    return this.detail(product.id);
  }

  async detail(id: bigint) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      omit: {
        deletedAt: true,
        operatedBy: true,
      },
      include: {
        skus: {
          where: {
            deletedAt: null,
          },
          omit: {
            deletedAt: true,
            operatedBy: true,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          omit: {
            deletedAt: true,
            operatedBy: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `id|${ERROR_NOTFOUND_MESSAGE_CODE.NOT_FOUND}`,
      );
    }

    return product;
  }

  async list(dto: ListProductDto) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };
    if (dto.search) {
      where.OR = [
        {
          name: {
            contains: dto.search,
          },
        },
        {
          number: {
            equals: dto.search,
          },
        },
      ];
    }
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      where.categories = {
        some: {
          id: {
            in: dto.categoryIds,
          },
        },
      };
    }
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (dto.page - 1) * dto.size,
        take: dto.size,
        orderBy: {
          id: 'desc',
        },
        omit: {
          deletedAt: true,
          operatedBy: true,
        },
        include: {
          skus: {
            where: {
              deletedAt: null,
            },
            omit: {
              deletedAt: true,
              operatedBy: true,
            },
          },
          categories: {
            where: {
              deletedAt: null,
            },
            omit: {
              deletedAt: true,
              operatedBy: true,
            },
          },
        },
      }),
      this.prisma.product.count({
        where,
      }),
    ]);
    return paginateData(products, total, dto.page, dto.size);
  }

  async delete(id: bigint) {
    const product = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      await tx.productSku.updateMany({
        where: {
          productId: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return product;
    });

    this.cacheService.del(RedisKey.productDetail(product.id));
    this.cacheService.del(RedisKey.productList);

    return product;
  }

  private async validateParams(
    params: CreateProductDto | UpdateProductDto,
    id?: bigint,
  ) {
    if (params.number) {
      const existNumber = await this.prisma.product.findFirst({
        where: {
          number: params.number,
          deletedAt: null,
          id: id ? { not: id } : undefined,
        },
      });
      if (existNumber) {
        throw new ConflictException(
          `number|${ERROR_CONFLICT_MESSAGE_CODE.DUPLICATE_SLUG}`,
        );
      }
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
      const categories = await this.prisma.productCategory.findMany({
        where: {
          id: {
            in: params.categoryIds,
          },
          deletedAt: null,
        },
      });
      if (!categories || categories.length !== params.categoryIds.length) {
        throw new BadRequestException(
          `categoryIds|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
        );
      }
    }
  }
}
