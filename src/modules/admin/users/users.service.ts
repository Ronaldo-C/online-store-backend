import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { $Enums, Prisma } from '@prisma/client';
import * as randomatic from 'randomatic';
import { ERROR_CONFLICT_MESSAGE_CODE } from 'src/typeDefs/error-code';
import { ListWithSearchDto, paginateData } from 'src/typeDefs/list-dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { TRequest } from 'src/typeDefs/request';
import { UpdateSelfDto } from './dto/update-self.dto';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @Inject(REQUEST) private readonly request: TRequest,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const exist = await this.prisma.user.findFirst({
      where: {
        name: createUserDto.name,
        status: { not: 'deleted' },
      },
    });
    if (exist) {
      throw new ConflictException(
        `name|${ERROR_CONFLICT_MESSAGE_CODE.DUPLICATE_SLUG}`,
      );
    }

    const password = randomatic('Aa0', 14);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        userRole: createUserDto.userRole,
        password: this.authService.signature({
          identifier: createUserDto.name,
          password,
        }),
        operatedBy: this.request.user.id,
        createdAt: new Date(),
      },
    });

    return {
      ...user,
      password,
    };
  }

  async list(listUserDto: ListWithSearchDto) {
    const where: Prisma.UserWhereInput = {
      status: { not: 'deleted' },
      deletedAt: null,
    };
    if (listUserDto.search) {
      where.OR = [
        {
          name: {
            contains: listUserDto.search,
          },
        },
        {
          email: {
            contains: listUserDto.search,
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        omit: {
          password: true,
          deletedAt: true,
          operatedBy: true,
        },
        skip: (listUserDto.page - 1) * listUserDto.size,
        take: listUserDto.size,
        orderBy: [
          {
            id: 'desc',
          },
        ],
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return paginateData(users, total, listUserDto.page, listUserDto.size);
  }

  async info() {
    return this.detail(this.request.user.id);
  }

  async detail(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
        deletedAt: true,
        operatedBy: true,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: `id|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
      });
    }

    return user;
  }

  async updateInfo(updateUserDto: UpdateSelfDto) {
    return this.update(this.request.user.id, updateUserDto, false);
  }

  async update(id: bigint, updateUserDto: UpdateUserDto, isUpdateRole = true) {
    if (updateUserDto.name) {
      const exist = await this.prisma.user.findFirst({
        where: {
          name: updateUserDto.name,
          status: { not: 'deleted' },
          id: { not: id },
        },
      });

      if (exist) {
        throw new ConflictException(
          `name|${ERROR_CONFLICT_MESSAGE_CODE.DUPLICATE_SLUG}`,
        );
      }
    }

    const updateUser = await this.detail(id);

    const updateData: Prisma.UserUpdateInput = {
      name: updateUserDto.name || updateUser.name,
      email: updateUserDto.email || updateUser.email,
      updatedAt: new Date(),
      operatedBy: this.request.user.id,
    };

    if (isUpdateRole) {
      updateData.userRole = updateUserDto.userRole || updateUser.userRole;
    }

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      omit: {
        password: true,
        deletedAt: true,
        operatedBy: true,
      },
      data: updateData,
    });
    return user;
  }

  async remove(id: bigint) {
    if (id === this.request.user.id) {
      throw new BadRequestException(
        `id|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
      );
    }

    const previousUser = await this.detail(id);
    if (previousUser.status === 'deleted') {
      throw new BadRequestException({
        message: `id|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
      });
    }

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: 'deleted',
        operatedBy: this.request.user.id,
        deletedAt: new Date(),
      },
      omit: {
        password: true,
        deletedAt: true,
        operatedBy: true,
      },
    });
    await this.authService.kickOut(id);

    return user;
  }

  async lock(id: bigint) {
    if (id === this.request.user.id) {
      throw new ForbiddenException(
        ERROR_CONFLICT_MESSAGE_CODE.INCORRECT_OPERATION,
      );
    }

    const user = await this.detail(id);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: $Enums.UserStatus.locked,
        updatedAt: new Date(),
        operatedBy: this.request.user.id,
      },
      omit: {
        password: true,
        deletedAt: true,
        operatedBy: true,
      },
    });

    await this.authService.kickOut(id);

    return updatedUser;
  }

  async unlock(id: bigint) {
    const user = await this.detail(id);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: $Enums.UserStatus.active,
        updatedAt: new Date(),
        operatedBy: this.request.user.id,
      },
      omit: {
        password: true,
        deletedAt: true,
        operatedBy: true,
      },
    });

    return updatedUser;
  }
}
