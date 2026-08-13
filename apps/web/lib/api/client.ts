const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.20.0.1:4000/api";

export type ApiSuccessResponse<T> = {
    success: true;
    message: string;
    data: T;
};

export type ApiErrorResponse = {
    success: false;
    message: string;
    data: null;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiClientError extends Error {
    status: number;
    payload: ApiErrorResponse;

    constructor(status: number, payload: ApiErrorResponse) {
        super(payload.message);
        this.name = "ApiClientError";
        this.status = status;
        this.payload = payload;
    }
}

// function notifyApiError(message: string) {
//     toast.error(message);
// }

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
        ? ((await response.json()) as ApiResponse<T>)
        : ({ success: false, message: await response.text(), data: null } as ApiErrorResponse);

    return payload;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type") && options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${DEFAULT_API_BASE_URL}${path}`, {
        ...options,
        credentials: options.credentials ?? "include",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const payload = await parseResponse<T>(response);

    if (!response.ok || !payload.success) {
        // notifyApiError(payload.message || `Request failed with status ${response.status}`);
        throw new ApiClientError(response.status, payload as ApiErrorResponse);
    }

    return payload.data;
}
