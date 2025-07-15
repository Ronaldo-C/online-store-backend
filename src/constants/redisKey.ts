export const RedisKey = {
  productList: `product:list`,
  productDetail: (id: bigint) => `product:detail:${id}`,
  productCategoryList: `product:category:list`,
  seoMeta: `seo:meta`,
};
