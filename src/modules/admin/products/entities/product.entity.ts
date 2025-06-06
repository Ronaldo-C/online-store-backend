import { ProductCategoryEntity } from '../../product-categories/entities/product-categories.entity';

export class ProductEntity {
  id: bigint;
  name: string;
  number: string;
  shelfStatus: boolean;
  thumbnail: string;
  pictures: string[];
  description: Record<string, any>;
  skus: ProductSku[];
  categories: ProductCategoryEntity[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  operatedBy: string;
}

export class ProductSku {
  id: bigint;
  name: string;
  number: string;
  costPrice: number;
  price: number;
  stock: bigint;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  operatedBy: string;
}
