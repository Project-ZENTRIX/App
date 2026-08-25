const DEFAULT_API_BASE_URL = "http://127.20.0.1:4000/api";
const AUTH_TOKEN_KEY = "zentrix-auth-token";

export type DesktopCourseItem = {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    difficulty: string;
    price: string;
    lessonCount: number;
    version: string;
    purchased: boolean;
    learnable: boolean;
    offline: boolean;
    status: string;
};

export type DesktopPackItem = {
    id: string;
    title: string;
    summary: string;
    manifestVersion: string;
    contentVersion: string;
    cacheState: string;
    offlineState: string;
    updatedAt: string;
    progress: number;
};

export type DesktopDeviceItem = {
    id: string;
    name: string;
    platform: string;
    status: string;
    binding: string;
    lastSeen: string;
    primary: boolean;
};

export type DesktopOrderItem = {
    orderNo: string;
    status: string;
    total: string;
    createdAt: string;
};

export type DesktopMembershipItem = {
    plan: string;
    status: string;
    period: string;
};

export type DesktopRunItem = {
    name: string;
    result: string;
    time: string;
};

export type DesktopProgressEventItem = {
    label: string;
    detail: string;
};

export type DesktopLicenseSummary = {
    id: string;
    licenseKey: string;
    status: string;
    maxDevices: number;
    deviceCount: number;
    issuedAt: string;
    expiresAt: string | null;
    latestEventAt: string | null;
};

export type DesktopAccount = {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    userProfile: {
        bio: string | null;
        avatarUrl: string | null;
    } | null;
};

export type DesktopAccessProfile = {
    primaryRole: string;
    roles: string[];
    allowedSurfaces: string[];
    permissions: string[];
};

export type DesktopProgressOverview = {
    userId: string;
    enrollments: Array<{
        id: string;
        courseId: string;
        status: string;
        enrolledAt: string;
        completedAt: string | null;
    }>;
    lessonProgress: {
        totalLessons: number;
        completedLessons: number;
        completionRate: number;
        items: Array<{
            lessonId: string;
            status: string;
            progress: number;
            lesson: {
                id: string;
                courseId: string;
                title: string;
                summary: string | null;
                sortOrder: number;
                status: string;
            } | null;
        }>;
    };
    recentEvents: Array<{
        id: string;
        eventType: string;
        courseId: string | null;
        lessonId: string | null;
        taskId: string | null;
        payload: unknown;
        createdAt: string;
    }>;
};

export type DesktopPortalSnapshot = {
    loading: boolean;
    error: string | null;
    account: DesktopAccount | null;
    accessProfile: DesktopAccessProfile | null;
    license: DesktopLicenseSummary | null;
    courses: DesktopCourseItem[];
    contentPacks: DesktopPackItem[];
    devices: DesktopDeviceItem[];
    orders: DesktopOrderItem[];
    memberships: DesktopMembershipItem[];
    progressEvents: DesktopProgressEventItem[];
    runs: DesktopRunItem[];
    progress: DesktopProgressOverview | null;
    cacheCount: number;
};

function getApiBaseUrl() {
    return (
        (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ??
        DEFAULT_API_BASE_URL
    ).replace(/\/$/, "");
}

export function getDesktopAuthToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setDesktopAuthToken(token: string | null) {
    if (typeof window === "undefined") {
        return;
    }

    if (token) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
}

async function parseJson<T>(response: Response) {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (null as T);
}

async function request<T>(path: string, token?: string | null) {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    const authToken = token ?? getDesktopAuthToken();
    if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, { headers });
    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        const payload = await response.text();
        throw new Error(payload || `Request failed with status ${response.status}`);
    }

    return parseJson<T>(response);
}

function formatMoney(value: string | number, currency: string) {
    const numeric = typeof value === "number" ? value : Number(value);
    const major = Number.isFinite(numeric) ? numeric : 0;
    if (currency === "CNY") {
        return `¥${major.toFixed(0)}`;
    }

    return `${currency} ${major.toFixed(2)}`;
}

function formatDateTime(value: string | Date | null | undefined) {
    if (!value) {
        return "-";
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function pickTitle(value: unknown, fallback: string) {
    return typeof value === "string" && value.trim() ? value : fallback;
}

export async function loadDesktopPortalSnapshot(): Promise<DesktopPortalSnapshot> {
    const [
        accountResponse,
        accessResponse,
        licenseResponse,
        coursesResponse,
        packsResponse,
        devicesResponse,
        ordersResponse,
        subscriptionsResponse,
        progressResponse,
        runsResponse,
    ] = await Promise.all([
        request<{ token: string | null; user: DesktopAccount }>("/auth/me"),
        request<DesktopAccessProfile>("/auth/me/access"),
        request<{ license: DesktopLicenseSummary | null }>("/auth/me/license"),
        request<{
            items: Array<{
                id: string;
                title: string;
                summary: string | null;
                tags: string[];
                difficulty: string | null;
                price: string | number;
                currency: string;
                status: string;
                version: number;
                version_label: string | null;
                lessonCount?: number;
                lesson_count?: number;
                is_purchased?: boolean;
                isLearnable?: boolean;
                is_offline?: boolean;
                isOffline?: boolean;
            }>;
        }>("/courses?sort=latest&pageSize=12"),
        request<{
            items: Array<{
                contentPackCode: string;
                title: string;
                summary: string;
                language: string;
                currentState: "authoring" | "published";
                version: string;
                revision: number;
                snapshotCount: number;
                fileCount: number;
                publishedAt: string;
            }>;
        }>("/content-packs"),
        request<{
            devices: Array<{
                id: string;
                name: string;
                platform: string;
                bindingCount: number;
                lastSeenAt: string | null;
                createdAt: string;
                updatedAt: string;
                bindings: Array<{
                    id: string;
                    bindingKey: string;
                    deviceSlot: number;
                    isPrimary: boolean;
                    boundAt: string;
                    revokedAt: string | null;
                    deviceFingerprint: string | null;
                    desktopLicense: { id: string; licenseKey: string; status: string; expiresAt: string | null } | null;
                }>;
            }>;
        }>("/auth/me/license/devices"),
        request<{
            items: Array<{
                id: string;
                orderNo: string;
                status: string;
                totalAmount: string | number;
                currency: string;
                createdAt: string;
                items: Array<{ id: string; name: string; quantity: number; unitPrice: string; subtotal: string }>;
            }>;
        }>("/orders"),
        request<{
            items: Array<{
                id: string;
                status: string;
                startedAt: string;
                endsAt: string | null;
                autoRenew: boolean;
                orderId: string | null;
                product: {
                    id: string;
                    name: string;
                    code: string;
                    description: string | null;
                    price: string;
                    currency: string;
                    status: string;
                    courseId: string | null;
                    course: { id: string; title: string; summary: string } | null;
                } | null;
            }>;
        }>("/subscriptions"),
        request<DesktopProgressOverview>("/progress/overview"),

        request<{
            items: Array<{
                id: string;
                taskId: string;
                status: string;
                input: string | null;
                output: string | null;
                error: string | null;
                runtimeMs: number | null;
                startedAt: string | null;
                finishedAt: string | null;
                createdAt: string;
                submittedAt: string | null;
            }>;
        }>("/runs"),
    ]);

    const account = accountResponse?.user ?? null;
    const license = licenseResponse?.license ?? null;

    const courses = (coursesResponse?.items ?? []).map((course) => ({
        id: course.id,
        title: course.title,
        summary: course.summary ?? "",
        tags: course.tags,
        difficulty: course.difficulty ?? "-",
        price: formatMoney(course.price, course.currency),
        lessonCount: course.lessonCount ?? course.lesson_count ?? 0,
        version: course.version_label ?? `v${course.version}`,
        purchased: Boolean(course.is_purchased),
        learnable: Boolean(course.isLearnable ?? course.is_purchased),
        offline: Boolean(course.is_offline ?? course.isOffline),
        status: course.status,
    }));

    const contentPacks = (packsResponse?.items ?? []).map((pack) => ({
        id: pack.contentPackCode,
        title: pack.title,
        summary: pack.summary,
        manifestVersion: `${pack.version} · rev ${pack.revision}`,
        contentVersion: pack.publishedAt ? formatDateTime(pack.publishedAt) : "-",
        cacheState: pack.currentState === "published" ? "已发布" : "草稿",
        offlineState: pack.language ? `${pack.language} · ${pack.fileCount} files` : `${pack.fileCount} files`,
        updatedAt: formatDateTime(pack.publishedAt),
        progress: Math.max(0.05, Math.min(1, pack.snapshotCount / Math.max(pack.fileCount, 1))),
    }));

    const devices = (devicesResponse?.devices ?? []).map((device) => {
        const latestBinding = device.bindings[0] ?? null;
        return {
            id: device.id,
            name: device.name,
            platform: device.platform,
            status: device.bindingCount > 0 ? "已绑定" : "未绑定",
            binding: latestBinding?.isPrimary ? "Primary" : device.bindingCount > 1 ? "Secondary" : "Linked",
            lastSeen: formatDateTime(device.lastSeenAt ?? device.updatedAt),
            primary: Boolean(latestBinding?.isPrimary),
        };
    });

    const orders = (ordersResponse?.items ?? []).map((order) => ({
        orderNo: order.orderNo,
        status: order.status,
        total: formatMoney(order.totalAmount, order.currency),
        createdAt: formatDateTime(order.createdAt),
    }));

    const memberships = (subscriptionsResponse?.items ?? []).map((subscription) => ({
        plan:
            subscription.product?.name ??
            pickTitle(subscription.product?.course?.title, subscription.orderId ?? subscription.id),
        status: subscription.status === "active" ? "有效" : subscription.status,
        period: `${formatDateTime(subscription.startedAt)} 至 ${subscription.endsAt ? formatDateTime(subscription.endsAt) : "-"}`,
    }));

    const progressEvents = (progressResponse?.recentEvents ?? []).map((event) => ({
        label: event.eventType,
        detail:
            typeof event.payload === "object" && event.payload && "message" in event.payload
                ? String((event.payload as Record<string, unknown>).message)
                : `${event.courseId ?? event.lessonId ?? event.taskId ?? "progress"}`,
    }));

    const runs = (runsResponse?.items ?? []).map((run) => ({
        name: run.taskId,
        result: run.status,
        time: formatDateTime(run.createdAt),
    }));

    return {
        loading: false,
        error: null,
        account,
        accessProfile: accessResponse ?? null,
        license,
        courses,
        contentPacks,
        devices,
        orders,
        memberships,
        progressEvents,
        runs,
        progress: progressResponse ?? null,
        cacheCount: contentPacks.length,
    };
}
