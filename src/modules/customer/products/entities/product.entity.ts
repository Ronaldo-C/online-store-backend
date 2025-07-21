import {
  Product,
  ProductCategory,
  ProductSku as ProductSkuModel,
} from '.prisma/client';
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

  constructor(
    product: Product & {
      skus: ProductSkuModel[];
      categories: ProductCategory[];
    },
  ) {
    this.id = product.id;
    this.name = product.name;
    this.number = product.number;
    this.shelfStatus = product.shelfStatus;
    this.thumbnail = product.thumbnail;
    this.pictures = product.pictures;
    this.description = product.description as Record<string, any>;
    this.skus = product.skus.map((item) => new ProductSku(item));
    this.categories = product.categories.map(
      (item) => new ProductCategoryEntity(item),
    );
  }
}

export class ProductSku {
  id: bigint;
  name: string;
  costPrice: number;
  price: number;
  stock: bigint;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  operatedBy: string;

  constructor(productSku: ProductSkuModel) {
    this.id = productSku.id;
    this.name = productSku.name;
    this.costPrice = productSku.costPrice;
    this.price = productSku.price;
    this.stock = productSku.stock;
  }
}
