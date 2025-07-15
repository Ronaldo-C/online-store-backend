import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async set(key: string, value: string, ttl: number = 60 * 10) {
    await this.redis.set(`cache-service:${key}`, value, 'EX', ttl);
  }

  async get(key: string) {
    return await this.redis.get(`cache-service:${key}`);
  }

  async del(key: string) {
    await this.redis.del(`cache-service:${key}`);
  }
}
