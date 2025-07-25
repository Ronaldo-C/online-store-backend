import { RedisService } from '@liaoliaots/nestjs-redis';
import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { UsersService } from '../users/users.service';
import { ERROR_UNAUTHORIZED_MESSAGE_CODE } from 'src/typeDefs/error-code';
import { $Enums } from '.prisma/client';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly redis: Redis | null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(
        ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
      );
    }
    try {
      const value = await this.redis.get(token);
      if (!value) {
        throw new UnauthorizedException(
          ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
        );
      }
      const payload = await this.jwtService.verifyAsync(token);
      const id = BigInt(payload['id']);
      const user = await this.userService.detail(id);

      const roles = this.reflector.get<$Enums.UserRole[]>(
        'roles',
        context.getHandler(),
      );
      if (roles && roles.length > 0 && !roles.includes(user.userRole)) {
        throw new UnauthorizedException(
          ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
        );
      }

      if (user.status !== $Enums.UserStatus.active) {
        throw new UnauthorizedException(
          ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
        );
      }
      request['user'] = user;
    } catch (err) {
      throw new UnauthorizedException(
        ERROR_UNAUTHORIZED_MESSAGE_CODE.UNAUTHORIZED,
      );
    }

    await this.redis.expire(token, 3600 * 24 * 3);

    return true;
  }
}
