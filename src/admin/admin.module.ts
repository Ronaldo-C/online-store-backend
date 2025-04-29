import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InitService } from './init.service';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [InitService],
})
export class AdminModule {}
