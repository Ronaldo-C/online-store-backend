import { ConflictException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TRequest } from 'src/typeDefs/request';
import { AuthService } from '../auth/auth.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ERROR_CONFLICT_MESSAGE_CODE } from 'src/typeDefs/error-code';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(REQUEST) private readonly request: TRequest,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateProductDto) {
    if (dto.number) {
      const existNumber = await this.prisma.product.findFirst({
        where: {
          number: dto.number,
          deletedAt: null,
        },
      });
      if (existNumber) {
        throw new ConflictException(
          `number|${ERROR_CONFLICT_MESSAGE_CODE.DUPLICATE_SLUG}`,
        );
      }
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
          omit: {
            deletedAt: true,
            operatedBy: true,
          },
        },
        categories: {
          omit: {
            deletedAt: true,
            operatedBy: true,
          },
        },
      },
    });
    return product;
  }
}
