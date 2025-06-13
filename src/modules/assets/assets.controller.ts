import { Controller, Get } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('getSignature')
  async getSignature() {
    return await this.assetsService.getSignatureForOSS();
  }
}
