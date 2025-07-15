import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ListProductDto } from './dto/list-product.dto';

@Controller('/customer/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(@Query() dto: ListProductDto) {
    return this.productsService.getProductList(dto);
  }

  @Get('/:id')
  async get(@Param('id') id: bigint) {
    return this.productsService.getProductDetail(id);
  }
}
