import { ProductEntity } from '../../products/entities/product.entity';

export class ProductCategoryEntity {
  id: bigint;
  name: string;
  products: ProductEntity[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  operatedBy: string;
}
