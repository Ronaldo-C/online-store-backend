import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import * as randomatic from 'randomatic';
import { ERROR_CONFLICT_MESSAGE_CODE } from 'src/typeDefs/error-code';
import { ListUserDto } from './dto/list-user.dto';
import { paginateData } from 'src/typeDefs/list-dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
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

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          userRole: createUserDto.userRole,
          password: this.authService.signature({
            identifier: createUserDto.name,
            password,
          }),
        },
      });
      const userId = user.id;
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          operatedBy: userId,
        },
      });
      return user;
    });

    return {
      ...user,
      password,
    };
  }

  async list(listUserDto: ListUserDto) {
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

  async detail(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: `id|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
      });
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
