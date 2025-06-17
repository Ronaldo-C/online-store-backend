import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ParseBigIntPipe } from 'src/utils/parse-pipes/parse-bigint-pipe';
import { ListWithSearchDto } from 'src/typeDefs/list-dto';

@UseGuards(AuthGuard)
@Controller('admin/product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoriesService.create(createProductCategoryDto);
  }

  @Get(':id')
  detail(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.productCategoriesService.detail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(id, updateProductCategoryDto);
  }

  @Get()
  list(@Query() listProductCategoryDto: ListWithSearchDto) {
    return this.productCategoriesService.list(listProductCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.productCategoriesService.delete(id);
  }
}
