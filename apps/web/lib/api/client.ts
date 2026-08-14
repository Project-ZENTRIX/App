const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.20.0.1:4000/api";
const LOCALE_COOKIE_KEY = "zentrix-locale";
type Locale = "zh-CN" | "en-GB";

const localizedErrors: Record<Locale, Record<string, string>> = {
    "zh-CN": {
        "error.internalServerError": "服务器内部错误",
        "error.invalidRequestPayload": "无效的请求内容",
        "error.invalidEmailFormat": "邮箱格式无效",
        "error.passwordTooShort": "密码至少需要 8 个字符",
        "error.invalidEmailOrPassword": "邮箱或密码错误",
        "error.passwordMismatch": "“密码”和“确认密码”不一致",
        "error.emailAlreadyExists": "邮箱已存在",
        "error.unauthorized": "未授权",
        "error.invalidCurrentPassword": "当前密码无效",
        "error.deviceNotFound": "未找到设备",
        "error.invalidBindingCode": "绑定码无效",
        "error.bindingCodeExpired": "绑定码已过期",
        "error.deviceLimitReached": "设备数量已达上限",
        "error.bindingNotFound": "未找到绑定记录",
        "error.taskNotFound": "未找到任务",
        "error.runNotFound": "未找到运行记录",
        "error.orderNotFound": "未找到订单",
        "error.paidOrderCannotBeCancelled": "已支付订单不能取消",
        "error.productNotFound": "未找到商品",
        "error.subscriptionNotFound": "未找到订阅",
        "error.atLeastOneOrderItemRequired": "至少需要一个订单项",
        "error.oneOrMoreProductsMissing": "一个或多个商品未找到",
        "error.quantityMustBePositive": "数量必须为正整数",
        "error.invalidPaymentStatus": "支付状态无效",
        "error.paymentNotFound": "未找到支付记录",
        "error.licenseNotFound": "未找到许可证",
        "error.integrationClientNotFound": "未找到集成客户端",
        "error.eventTypeRequired": "eventType 不能为空",
    },
    "en-GB": {
        "error.internalServerError": "Internal server error",
        "error.invalidRequestPayload": "Invalid request payload",
        "error.invalidEmailFormat": "Invalid email format",
        "error.passwordTooShort": "Password must be at least 8 characters long",
        "error.invalidEmailOrPassword": "Invalid email or password",
        "error.passwordMismatch": '"Password" and "Confirm Password" do not match',
        "error.emailAlreadyExists": "Email already exists",
        "error.unauthorized": "Unauthorized",
        "error.invalidCurrentPassword": "Invalid current password",
        "error.deviceNotFound": "Device not found",
        "error.invalidBindingCode": "Invalid binding code",
        "error.bindingCodeExpired": "Binding code expired",
        "error.deviceLimitReached": "Device limit reached",
        "error.bindingNotFound": "Binding not found",
        "error.taskNotFound": "Task not found",
        "error.runNotFound": "Run not found",
        "error.orderNotFound": "Order not found",
        "error.paidOrderCannotBeCancelled": "Paid orders cannot be cancelled",
        "error.productNotFound": "Product not found",
        "error.subscriptionNotFound": "Subscription not found",
        "error.atLeastOneOrderItemRequired": "At least one order item is required",
        "error.oneOrMoreProductsMissing": "One or more products were not found",
        "error.quantityMustBePositive": "Quantity must be a positive integer",
        "error.invalidPaymentStatus": "Invalid payment status",
        "error.paymentNotFound": "Payment not found",
        "error.licenseNotFound": "License not found",
        "error.integrationClientNotFound": "Integration client not found",
        "error.eventTypeRequired": "eventType is required",
    },
};

function resolveLocale() {
    if (typeof document !== "undefined") {
        const cookieLocale = document.cookie
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith(`${LOCALE_COOKIE_KEY}=`))
            ?.split("=")[1];
        if (cookieLocale === "zh-CN" || cookieLocale === "en-GB") {
            return cookieLocale;
        }
    }

    if (typeof navigator !== "undefined") {
        if (navigator.language.startsWith("zh")) {
            return "zh-CN";
        }

        if (navigator.language.startsWith("en")) {
            return "en-GB";
        }
    }

    return "en-GB";
}

function getLocalizedErrorMessage(message: string, locale: Locale) {
    return localizedErrors[locale][message] ?? message;
}

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

function localizeError(message: string, locale: Locale) {
    return getLocalizedErrorMessage(message, locale);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const locale = resolveLocale();
    headers.set("x-zentrix-locale", locale);
    headers.set("accept-language", locale);
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
        const locale = resolveLocale();
        throw new ApiClientError(response.status, {
            ...payload,
            message: localizeError(payload.message, locale),
        } as ApiErrorResponse);
    }

    return payload.data;
}
