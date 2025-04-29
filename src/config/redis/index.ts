import { RedisModuleAsyncOptions } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';

export const redisAsyncOptions: RedisModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    config: [
      {
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      },
    ],
  }),
};
