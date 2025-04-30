import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { redisAsyncOptions } from './config/redis';
import { SharedModule } from './shared';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync(redisAsyncOptions),
    AdminModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
