import { Controller, Get, Put, UseGuards, Body } from '@nestjs/common';
import { SeoMetasService } from './seo-metas.service';
import { SeoMetaEntity } from './entities/seo-metas.entity';
import { UpdateSeoMetasDto } from './dto/update-seo-metas.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('后台管理/SEO设置')
@UseGuards(AuthGuard)
@Controller('admin/seo-metas')
export class SeoMetasController {
  constructor(private readonly seoMetasService: SeoMetasService) {}

  @ApiOperation({ summary: 'SEO设置详情' })
  @ApiOkResponse({
    description: '成功',
    type: SeoMetaEntity,
  })
  @Get()
  async detail(): Promise<SeoMetaEntity> {
    const item = await this.seoMetasService.detail();
    return item;
  }

  @ApiOperation({ summary: '更新SEO设置' })
  @ApiOkResponse({
    description: '成功',
    type: SeoMetaEntity,
  })
  @Put()
  async update(@Body() dto: UpdateSeoMetasDto): Promise<SeoMetaEntity> {
    const item = await this.seoMetasService.update(dto);
    return item;
  }
}
