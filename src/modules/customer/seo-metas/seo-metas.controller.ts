import { Controller, Get } from '@nestjs/common';
import { SeoMetasService } from './seo-metas.service';

@Controller('customer/seo-metas')
export class SeoMetasController {
  constructor(private readonly seoMetasService: SeoMetasService) {}

  @Get()
  async getSeoMetas() {
    return await this.seoMetasService.getSeoMetas();
  }
}
