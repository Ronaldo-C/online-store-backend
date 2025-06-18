import { ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';

export const pinoAsyncOptions: LoggerModuleAsyncParams = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const NODE_ENV = configService.get('NODE_ENV');
    return {
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
        level: NODE_ENV !== 'production' ? 'trace' : 'info',
        serializers: {
          req: (req) => {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              query: req.query,
              headers: {
                authorization: req.headers?.authorization,
              },
              body: req.raw.body,
            };
          },
        },
      },
    };
  },
};
