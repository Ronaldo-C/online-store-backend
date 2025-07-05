import {
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { $Enums } from '@prisma/client';
import * as crypto from 'crypto';
import {
  ERROR_AUTH_MESSAGE_CODE,
  ERROR_CONFLICT_MESSAGE_CODE,
  ERROR_NOTFOUND_MESSAGE_CODE,
  ERROR_UNAUTHORIZED_MESSAGE_CODE,
} from 'src/typeDefs/error-code';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as randomatic from 'randomatic';
import { TRequest } from 'src/typeDefs/request';
import { REQUEST } from '@nestjs/core';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  private readonly redis: Redis | null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: TRequest,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        name: loginDto.name,
        status: { not: $Enums.UserStatus.deleted },
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: ERROR_NOTFOUND_MESSAGE_CODE.NOT_FOUND,
      });
    }
    const password = this.signature({
      identifier: loginDto.name,
      password: loginDto.password,
    });
    if (password !== user.password) {
      throw new NotAcceptableException({
        message: ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
      });
    }
    if (user.status === $Enums.UserStatus.locked) {
      throw new NotAcceptableException({
        message: ERROR_AUTH_MESSAGE_CODE.LOCKED,
      });
    }
    if (user.status === $Enums.UserStatus.unusual) {
      throw new NotAcceptableException({
        message: ERROR_AUTH_MESSAGE_CODE.STATUS_ERROR,
      });
    }

    const accessToken = await this.jwtService.signAsync(user);
    const key = `ACCESS_TOKEN_LOGIN_USER_${user.id}`;
    await this.redis.set(accessToken, '1', 'EX', 3600 * 24 * 3);
    await this.redis.sadd(key, accessToken);

    return {
      ...user,
      accessToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const previousUser = await this.prisma.user.findFirst({
      where: {
        id: resetPasswordDto.userId,
        status: { not: $Enums.UserStatus.deleted },
      },
    });

    if (!previousUser) {
      throw new NotFoundException({
        message: `id|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
      });
    }

    const password = randomatic('Aa0', 14);
    const user = await this.prisma.user.update({
      where: {
        id: previousUser.id,
      },
      data: {
        operatedBy: this.request.user.id,
        password: this.signature({
          identifier: previousUser.name,
          password,
        }),
      },
    });
    return {
      ...user,
      password,
    };
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: updatePasswordDto.userId,
        status: { not: $Enums.UserStatus.deleted },
      },
    });

    if (!user) {
      throw new NotFoundException({
        message: `id|${ERROR_CONFLICT_MESSAGE_CODE.INVALID_RELATION}`,
      });
    }

    const originPassword = this.signature({
      identifier: user.name,
      password: updatePasswordDto.password,
    });

    if (originPassword !== user.password) {
      throw new NotAcceptableException({
        message: ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: updatePasswordDto.userId,
      },
      data: {
        operatedBy: this.request.user.id,
        password: this.signature({
          identifier: user.name,
          password: updatePasswordDto.updatedPassword,
        }),
      },
    });

    const excludes = [
      this.request.headers.authorization.replace('Bearer', '').trim(),
    ];
    await this.kickOut(updatePasswordDto.userId, excludes);

    return updatedUser;
  }

  signature(dto: { identifier: string; password: string }) {
    const hash = crypto.createHash('sha256');
    return hash.update(`${dto.identifier}_${dto.password}`).digest('hex');
  }

  async kickOut(userId: bigint, excludes?: string[]) {
    const key = `ACCESS_TOKEN_LOGIN_USER_${userId.toString()}`;
    const tokens = await this.redis.smembers(key);
    await Promise.all(
      tokens
        .filter((token) => {
          if (excludes) {
            return !excludes.includes(token);
          }
          return true;
        })
        .map((token) => this.redis.del(token)),
    );
    await this.redis.del(key);
  }
}
