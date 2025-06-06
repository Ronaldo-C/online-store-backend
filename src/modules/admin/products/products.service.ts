import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TRequest } from 'src/typeDefs/request';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ERROR_BAD_REQUEST_MESSAGE_CODE,
  ERROR_CONFLICT_MESSAGE_CODE,
} from 'src/typeDefs/error-code';
import { UpdateProductDto } from './dto/update-product.dto';
import { isEmpty } from 'lodash';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
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
