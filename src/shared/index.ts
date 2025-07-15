import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './cache/cache.service';

@Global()
@Module({
  providers: [PrismaService, CacheService],
  exports: [PrismaService, CacheService],
})
export class SharedModule {}
