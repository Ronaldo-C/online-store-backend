import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TRequest } from 'src/typeDefs/request';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import {
  ERROR_CONFLICT_MESSAGE_CODE,
  ERROR_NOTFOUND_MESSAGE_CODE,
} from 'src/typeDefs/error-code';
import { ListWithSearchDto, paginateData } from 'src/typeDefs/list-dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @Inject(REQUEST) private readonly request: TRequest,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateProductCategoryDto) {
    await this.validateParams(dto);

    const category = await this.prisma.productCategory.create({
      data: {
        name: dto.name,
        operatedBy: this.request.user.id,
      },
    });
    return this.detail(category.id);
  }

  async update(id: bigint, dto: UpdateProductCategoryDto) {
    await this.validateParams(dto, id);

    const category = await this.prisma.productCategory.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: dto.name,
        operatedBy: this.request.user.id,
      },
    });

    return this.detail(category.id);
  }

  async detail(id: bigint) {
    const category = await this.prisma.productCategory.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      omit: {
        deletedAt: true,
        operatedBy: true,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `id|${ERROR_NOTFOUND_MESSAGE_CODE.NOT_FOUND}`,
      );
    }

    return category;
  }

  async list(dto: ListWithSearchDto) {
    const where: any = {
      deletedAt: null,
    };

    if (dto.search) {
      where.name = {
        contains: dto.search,
      };
    }

    const [categories, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        omit: {
          deletedAt: true,
          operatedBy: true,
        },
        skip: dto.isAll ? undefined : (dto.page - 1) * dto.size,
        take: dto.isAll ? undefined : dto.size,
      }),
      this.prisma.productCategory.count({ where }),
    ]);

    return paginateData(categories, total, dto.page, dto.size);
  }

  async delete(id: bigint) {
    const category = await this.prisma.productCategory.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        operatedBy: this.request.user.id,
      },
    });

    return category;
  }

  private async validateParams(
    params: CreateProductCategoryDto | UpdateProductCategoryDto,
    id?: bigint,
  ) {
    if (params.name) {
      const existName = await this.prisma.productCategory.findFirst({
        where: {
          name: params.name,
          deletedAt: null,
          id: id ? { not: id } : undefined,
        },
      });
      if (existName) {
        throw new ConflictException(
          `name|${ERROR_CONFLICT_MESSAGE_CODE.DUPLICATE_SLUG}`,
        );
      }
    }
  }
}
