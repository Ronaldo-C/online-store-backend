import { ProductCategory } from '.prisma/client';

export class ProductCategoryEntity {
  id: bigint;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  operatedBy: string;

  constructor(productCategory: ProductCategory) {
    this.id = productCategory.id;
    this.name = productCategory.name;
  }
}
