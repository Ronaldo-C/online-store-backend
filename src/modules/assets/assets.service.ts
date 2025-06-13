import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';

@Injectable()
export class AssetsService {
  private client: OSS;

  private config = {
    accessKeyId: this.configService.get('OSS_ACCESS_KEY_ID'),
    accessKeySecret: this.configService.get('OSS_ACCESS_KEY_SECRET'),
    bucket: this.configService.get('OSS_BUCKET_NAME'),
  };

  constructor(private readonly configService: ConfigService) {
    this.client = new OSS(this.config);
  }

  async getSignatureForOSS() {
    const date = new Date();

    date.setDate(date.getDate() + 1);

    const policy = {
      expiration: date.toISOString(),
      conditions: [['content-length-range', 0, 1048576000]],
    };

    const formData = this.client.calculatePostSignature(policy);

    const location = await this.client.getBucketLocation(this.config.bucket);

    const host =
      `http://${this.config.bucket}.${location.location}.aliyuncs.com`.toString();

    const params = {
      policy: formData.policy,
      signature: formData.Signature,
      ossAccessKeyId: formData.OSSAccessKeyId,
      host,
    };

    return params;
  }
}
