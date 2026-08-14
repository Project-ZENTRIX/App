export const errorKeys = {
    internalServerError: "error.internalServerError",
    invalidRequestPayload: "error.invalidRequestPayload",
    invalidEmailFormat: "error.invalidEmailFormat",
    passwordTooShort: "error.passwordTooShort",
    invalidEmailOrPassword: "error.invalidEmailOrPassword",
    passwordMismatch: "error.passwordMismatch",
    emailAlreadyExists: "error.emailAlreadyExists",
    unauthorized: "error.unauthorized",
    invalidCurrentPassword: "error.invalidCurrentPassword",
    deviceNotFound: "error.deviceNotFound",
    invalidBindingCode: "error.invalidBindingCode",
    bindingCodeExpired: "error.bindingCodeExpired",
    deviceLimitReached: "error.deviceLimitReached",
    bindingNotFound: "error.bindingNotFound",
    taskNotFound: "error.taskNotFound",
    runNotFound: "error.runNotFound",
    orderNotFound: "error.orderNotFound",
    paidOrderCannotBeCancelled: "error.paidOrderCannotBeCancelled",
    productNotFound: "error.productNotFound",
    subscriptionNotFound: "error.subscriptionNotFound",
    atLeastOneOrderItemRequired: "error.atLeastOneOrderItemRequired",
    oneOrMoreProductsMissing: "error.oneOrMoreProductsMissing",
    quantityMustBePositive: "error.quantityMustBePositive",
    invalidPaymentStatus: "error.invalidPaymentStatus",
    paymentNotFound: "error.paymentNotFound",
    licenseNotFound: "error.licenseNotFound",
    integrationClientNotFound: "error.integrationClientNotFound",
    eventTypeRequired: "error.eventTypeRequired",
    taskIdRequired: "error.taskIdRequired",
    invalidSandboxStatus: "error.invalidSandboxStatus",
    invalidPaymentWebhookStatus: "error.invalidPaymentWebhookStatus",
    invalidLicenseWebhookStatus: "error.invalidLicenseWebhookStatus",
} as const;

export type ErrorKey = (typeof errorKeys)[keyof typeof errorKeys];

const messageToKey: Record<string, ErrorKey> = {
    "Invalid request payload": errorKeys.invalidRequestPayload,
    "Invalid email format": errorKeys.invalidEmailFormat,
    "Password must be at least 8 characters long": errorKeys.passwordTooShort,
    "Invalid email or password": errorKeys.invalidEmailOrPassword,
    '"Password" and "Confirm Password" do not match': errorKeys.passwordMismatch,
    "Email already exists": errorKeys.emailAlreadyExists,
    Unauthorized: errorKeys.unauthorized,
    "Invalid current password": errorKeys.invalidCurrentPassword,
    "Device not found": errorKeys.deviceNotFound,
    "Invalid binding code": errorKeys.invalidBindingCode,
    "Binding code expired": errorKeys.bindingCodeExpired,
    "Device limit reached": errorKeys.deviceLimitReached,
    "Binding not found": errorKeys.bindingNotFound,
    "Task not found": errorKeys.taskNotFound,
    "Run not found": errorKeys.runNotFound,
    "Order not found": errorKeys.orderNotFound,
    "Paid orders cannot be cancelled": errorKeys.paidOrderCannotBeCancelled,
    "Product not found": errorKeys.productNotFound,
    "Subscription not found": errorKeys.subscriptionNotFound,
    "At least one order item is required": errorKeys.atLeastOneOrderItemRequired,
    "One or more products were not found": errorKeys.oneOrMoreProductsMissing,
    "Quantity must be a positive integer": errorKeys.quantityMustBePositive,
    "Invalid payment status": errorKeys.invalidPaymentStatus,
    "Payment not found": errorKeys.paymentNotFound,
    "License not found": errorKeys.licenseNotFound,
    "Integration client not found": errorKeys.integrationClientNotFound,
    "eventType is required": errorKeys.eventTypeRequired,
    "taskId is required": errorKeys.taskIdRequired,
    "Invalid payment webhook status": errorKeys.invalidPaymentWebhookStatus,
    "Invalid license status": errorKeys.invalidLicenseWebhookStatus,
    "Invalid run status": errorKeys.invalidSandboxStatus,
    "Internal server error": errorKeys.internalServerError,
};

export function toErrorKey(message: string | string[] | null | undefined): ErrorKey {
    const normalized = Array.isArray(message) ? message[0] : message;
    if (!normalized) {
        return errorKeys.internalServerError;
    }

    if (normalized.startsWith("error.")) {
        return normalized as ErrorKey;
    }

    return messageToKey[normalized] ?? errorKeys.internalServerError;
}
