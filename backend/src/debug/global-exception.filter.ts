import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { headers?: any }>();
    const res = ctx.getResponse<any>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message ?? exception.message
        : (exception as any)?.message ?? String(exception);

    const name = (exception as any)?.name ?? null;
    const code = (exception as any)?.code ?? (exception as any)?.driverError?.code ?? null;

    const errorMessage = Array.isArray(message) ? message.join('; ') : String(message);

    // LOG THE ERROR SO WE CAN SEE IT
    console.error('='.repeat(80));
    console.error('[GlobalExceptionFilter] Caught exception:');
    console.error('URL:', (req as any)?.url);
    console.error('Method:', (req as any)?.method);
    console.error('Status:', status);
    console.error('Error Name:', name);
    console.error('Error Code:', code);
    console.error('Message:', errorMessage);
    if (exception instanceof Error) {
      console.error('Stack:', exception.stack);
    } else {
      console.error('Exception:', exception);
    }
    console.error('='.repeat(80));

    res.status(status).json({
      statusCode: status,
      error: name ?? 'Error',
      message: errorMessage,
      code,
      path: (req as any)?.url ?? null,
      timestamp: new Date().toISOString(),
    });
  }
}

