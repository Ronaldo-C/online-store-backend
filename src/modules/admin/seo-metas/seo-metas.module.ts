import { Module } from '@nestjs/common';
import { SeoMetasService } from './seo-metas.service';
import { SeoMetasController } from './seo-metas.controller';

@Module({
  controllers: [SeoMetasController],
  providers: [SeoMetasService],
})
export class SeoMetasModule {}
