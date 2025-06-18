import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './utils/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { SWAGGER_AUTH_USERS } from './constants/swagger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  if (configService.get('NODE_ENV') !== 'production') {
    const SWAGGER_DOC_DESCRIPTION = readFileSync(
      'SWAGGER_DOC_DESCRIPTION.md',
      'utf8',
    );

    const config = new DocumentBuilder()
      .setTitle('Online Store APIs')
      .setDescription(SWAGGER_DOC_DESCRIPTION)
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        SWAGGER_AUTH_USERS.ADMIN_USER,
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('apis', app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  try {
    await app.listen(configService.get('APP_PORT'));
    logger.verbose(
      `Application is running on: ${await app.getUrl()}, env: ${configService.get(
        'NODE_ENV',
      )}`,
    );
  } catch (error) {
    logger.error(error, error.stack);
  }
}
bootstrap();
