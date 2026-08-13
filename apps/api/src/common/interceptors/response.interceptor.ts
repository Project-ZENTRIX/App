import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, { success: boolean; message: string; data: T }> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<{ success: boolean; message: string; data: T }> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                message: "OK",
                data,
            }))
        );
    }
}
