import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InitService } from './init.service';
import { ProductsModule } from './products/products.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { SeoMetasModule } from './seo-metas/seo-metas.module';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule, ProductCategoriesModule, SeoMetasModule],
  providers: [InitService],
})
export class AdminModule {}
