import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ERROR_BAD_REQUEST_MESSAGE_CODE } from 'src/typeDefs/error-code';

@Injectable()
export class ParseBigIntPipe implements PipeTransform {
  transform(value: any) {
    try {
      return BigInt(value);
    } catch (error) {
      throw new BadRequestException(
        `id|${ERROR_BAD_REQUEST_MESSAGE_CODE.MUST_BIGINT}`,
      );
    }
  }
}
