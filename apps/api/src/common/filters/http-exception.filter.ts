import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { errorKeys, toErrorKey } from "../errors/error-keys.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
        const message =
            typeof exceptionResponse === "string"
                ? exceptionResponse
                : exceptionResponse && typeof exceptionResponse === "object" && "message" in exceptionResponse
                  ? Array.isArray((exceptionResponse as { message?: string | string[] }).message)
                      ? ((exceptionResponse as { message?: string[] }).message?.join(", ") ?? errorKeys.internalServerError)
                      : ((exceptionResponse as { message?: string }).message ?? errorKeys.internalServerError)
                  : exception instanceof Error
                    ? exception.message
                    : errorKeys.internalServerError;
        const key = toErrorKey(message);

        this.logger.error(`${status} ${message}`, exception instanceof Error ? exception.stack : undefined);

        response.status(status).json({
            success: false,
            message: key,
            data: null,
        });
    }
}
