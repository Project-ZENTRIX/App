export interface ApiResponseDto<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}
