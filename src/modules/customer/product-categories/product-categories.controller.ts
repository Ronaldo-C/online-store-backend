import { Controller, Get } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';

@Controller('customer/product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Get()
  async getProductCategoryList() {
    return await this.productCategoriesService.getProductCategoryList();
  }
}
