import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { redisAsyncOptions } from './config/redis';
import { SharedModule } from './shared';
import { AssetsModule } from './modules/assets/assets.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoAsyncOptions } from './config/logger';
import { CustomerModule } from './modules/customer/customer.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync(pinoAsyncOptions),
    RedisModule.forRootAsync(redisAsyncOptions),
    AdminModule,
    SharedModule,
    AssetsModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
