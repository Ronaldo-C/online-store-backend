import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const id = request.id;

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const msg = exceptionResponse.message;

    this.logger.warn(
      `traceId: ${id}, ${request.method} ${request.url} ${status} ${msg}`,
    );

    response.status(status).json({
      code: status,
      msg,
      id,
      timestamp: new Date().toISOString(),
    });
  }
}
