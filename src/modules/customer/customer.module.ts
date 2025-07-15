import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { SeoMetasModule } from './seo-metas/seo-metas.module';

@Module({
  imports: [ProductsModule, ProductCategoriesModule, SeoMetasModule],
})
export class CustomerModule {}
