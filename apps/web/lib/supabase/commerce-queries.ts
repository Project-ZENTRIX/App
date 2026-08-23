import { getCurrentUser, selectOne, selectRows } from "./browser-client";

type ProductRow = {
    id: string;
    course_id: string | null;
    code: string;
    name: string;
    description: string | null;
    status: string;
    price: string | number;
    currency: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type CourseRow = {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
};

type OrderRow = {
    id: string;
    user_id: string;
    order_no: string;
    status: string;
    total_amount: string | number;
    currency: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type OrderItemRow = {
    id: string;
    order_id: string;
    product_id: string | null;
    name: string;
    quantity: number;
    unit_price: string | number;
    created_at: string;
    deleted_at: string | null;
};

type PaymentRow = {
    id: string;
    user_id: string;
    order_id: string | null;
    payment_no: string;
    status: string;
    amount: string | number;
    currency: string;
    created_at: string;
};

type SubscriptionRow = {
    id: string;
    user_id: string;
    product_id: string | null;
    order_id: string | null;
    status: string;
    started_at: string;
    ends_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type ProductItem = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    price: string;
    currency: string;
    status: string;
    courseId: string | null;
    course: {
        id: string;
        title: string;
        summary: string;
    } | null;
};

export type OrderItem = {
    id: string;
    orderNo: string;
    status: string;
    totalAmount: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
    canPay: boolean;
    canCancel: boolean;
    items: Array<{
        id: string;
        productId: string | null;
        name: string;
        quantity: number;
        unitPrice: string;
        subtotal: string;
    }>;
    payments: Array<{
        id: string;
        paymentNo: string;
        status: string;
        amount: string;
        currency: string;
        createdAt: string;
    }>;
};

export type OrderDetail = OrderItem;

export type SubscriptionItem = {
    id: string;
    status: string;
    startedAt: string;
    endsAt: string | null;
    autoRenew: boolean;
    product: ProductItem | null;
    orderId: string | null;
};

export type PaymentStatus = {
    orderId: string;
    orderStatus: string;
    paymentStatus: string;
    paymentId: string | null;
};

function toNumber(value: string | number) {
    return typeof value === "number" ? value : Number(value);
}

function toMoney(value: string | number) {
    return toNumber(value).toFixed(2);
}

async function requireSession(token?: string | null): Promise<CurrentUser> {
    const session = await getCurrentUser(token);
    if (!session) {
        throw new Error("Unauthorized");
    }

    return session;
}

function mapCourse(course: CourseRow | null) {
    if (!course) {
        return null;
    }

    return {
        id: course.id,
        title: course.title,
        summary: course.summary ?? "",
    };
}

function mapProduct(product: ProductRow, course: CourseRow | null): ProductItem {
    return {
        id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        price: toMoney(product.price),
        currency: product.currency,
        status: product.status,
        courseId: product.course_id,
        course: mapCourse(course),
    };
}

function mapOrderItem(item: OrderItemRow) {
    const unitPrice = toMoney(item.unit_price);

    return {
        id: item.id,
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: toMoney(Number(unitPrice) * item.quantity),
    };
}

function mapPayment(payment: PaymentRow) {
    return {
        id: payment.id,
        paymentNo: payment.payment_no,
        status: payment.status,
        amount: toMoney(payment.amount),
        currency: payment.currency,
        createdAt: payment.created_at,
    };
}

function mapOrder(order: OrderRow, items: OrderItemRow[], payments: PaymentRow[]): OrderItem {
    const status = order.status;
    const isActionable = status === "pending";

    return {
        id: order.id,
        orderNo: order.order_no,
        status,
        totalAmount: toMoney(order.total_amount),
        currency: order.currency,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        canPay: isActionable,
        canCancel: isActionable,
        items: items.map(mapOrderItem),
        payments: payments.map(mapPayment),
    };
}

function mapSubscription(subscription: SubscriptionRow, product: ProductItem | null): SubscriptionItem {
    return {
        id: subscription.id,
        status: subscription.status,
        startedAt: subscription.started_at,
        endsAt: subscription.ends_at,
        autoRenew: subscription.status === "active",
        product,
        orderId: subscription.order_id,
    };
}

async function loadProductCourses(products: ProductRow[]) {
    const courseIds = Array.from(
        new Set(products.map((product) => product.course_id).filter((value): value is string => Boolean(value)))
    );
    if (!courseIds.length) {
        return new Map<string, CourseRow | null>();
    }

    const courses = await selectRows<CourseRow>("public", "courses");
    const courseById = new Map(courses.map((course) => [course.id, course]));
    return new Map(courseIds.map((courseId) => [courseId, courseById.get(courseId) ?? null]));
}

async function loadProducts(token?: string | null) {
    const products = await selectRows<ProductRow>(
        "public",
        "products",
        {
            deleted_at: null,
        },
        "*",
        {
            column: "created_at",
            ascending: false,
        },
        token
    );

    return products;
}

async function loadSubscriptions(token?: string | null) {
    const session = await requireSession(token);
    return selectRows<SubscriptionRow>(
        "public",
        "subscriptions",
        {
            user_id: session.id,
            deleted_at: null,
        },
        "*",
        {
            column: "created_at",
            ascending: false,
        },
        token
    );
}

async function loadOrderRelations(orderIds: string[], token?: string | null) {
    const relations = await Promise.all(
        orderIds.map(async (orderId) => {
            const [items, payments] = await Promise.all([
                selectRows<OrderItemRow>(
                    "public",
                    "order_items",
                    {
                        order_id: orderId,
                        deleted_at: null,
                    },
                    "*",
                    {
                        column: "created_at",
                        ascending: true,
                    },
                    token
                ),
                selectRows<PaymentRow>(
                    "public",
                    "payments",
                    {
                        order_id: orderId,
                        deleted_at: null,
                    },
                    "id,user_id,order_id,payment_no,status,amount,currency,created_at",
                    {
                        column: "created_at",
                        ascending: false,
                    },
                    token
                ),
            ]);

            return [orderId, { items, payments }] as const;
        })
    );

    return new Map(relations);
}

async function loadOrder(token: string | null | undefined, orderId: string, userId: string) {
    const order = await selectOne<OrderRow>(
        "public",
        "orders",
        {
            id: orderId,
            user_id: userId,
            deleted_at: null,
        },
        "*",
        undefined,
        token
    );

    if (!order) {
        return null;
    }

    const relations = await loadOrderRelations([order.id], token);
    const relation = relations.get(order.id);
    return relation ? mapOrder(order, relation.items, relation.payments) : mapOrder(order, [], []);
}

async function loadSubscriptionProduct(productId: string | null, token?: string | null) {
    if (!productId) {
        return null;
    }

    const product = await selectOne<ProductRow>(
        "public",
        "products",
        {
            id: productId,
            deleted_at: null,
        },
        "*",
        undefined,
        token
    );

    if (!product) {
        return null;
    }

    const courses = await loadProductCourses([product]);
    return mapProduct(product, courses.get(product.course_id ?? "") ?? null);
}

export async function listProducts(
    query: { keyword?: string; status?: string; courseId?: string } = {},
    token?: string | null
) {
    const products = await loadProducts(token);
    const courses = await loadProductCourses(products);
    const keyword = query.keyword?.trim().toLowerCase();

    const filtered = products.filter((product) => {
        if (query.status && product.status !== query.status) {
            return false;
        }

        if (query.courseId && product.course_id !== query.courseId) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        const course = product.course_id ? (courses.get(product.course_id) ?? null) : null;
        return [product.name, product.code, product.description ?? "", course?.title ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
    });

    return {
        items: filtered.map((product) =>
            mapProduct(product, product.course_id ? (courses.get(product.course_id) ?? null) : null)
        ),
    };
}

export async function listOrders(token?: string | null) {
    const session = await requireSession(token);
    const orders = await selectRows<OrderRow>(
        "public",
        "orders",
        {
            user_id: session.id,
            deleted_at: null,
        },
        "*",
        {
            column: "created_at",
            ascending: false,
        },
        token
    );

    const relations = await loadOrderRelations(
        orders.map((order) => order.id),
        token
    );
    return {
        items: orders.map((order) => {
            const relation = relations.get(order.id) ?? { items: [], payments: [] };
            return mapOrder(order, relation.items, relation.payments);
        }),
    };
}

export async function getOrder(orderId: string, token?: string | null) {
    const session = await requireSession(token);
    return loadOrder(token, orderId, session.id);
}

export async function getPaymentStatus(orderId: string, token?: string | null): Promise<PaymentStatus> {
    const order = await getOrder(orderId, token);
    if (!order) {
        throw new Error("Order not found");
    }

    const latestPayment = order.payments[0] ?? null;
    return {
        orderId: order.id,
        orderStatus: order.status,
        paymentStatus: latestPayment?.status ?? "initiated",
        paymentId: latestPayment?.id ?? null,
    };
}

export async function getCurrentSubscription(token?: string | null) {
    const session = await requireSession(token);
    const subscription = await selectOne<SubscriptionRow>(
        "public",
        "subscriptions",
        {
            user_id: session.id,
            status: "active",
            deleted_at: null,
        },
        "*",
        {
            column: "created_at",
            ascending: false,
        },
        token
    );

    if (!subscription) {
        return null;
    }

    return mapSubscription(subscription, await loadSubscriptionProduct(subscription.product_id, token));
}

export async function listSubscriptions(token?: string | null) {
    const subscriptions = await loadSubscriptions(token);
    return {
        items: await Promise.all(
            subscriptions.map(async (subscription) =>
                mapSubscription(subscription, await loadSubscriptionProduct(subscription.product_id, token))
            )
        ),
    };
}

export async function getSubscription(subscriptionId: string, token?: string | null) {
    const session = await requireSession(token);
    const subscription = await selectOne<SubscriptionRow>(
        "public",
        "subscriptions",
        {
            id: subscriptionId,
            user_id: session.id,
            deleted_at: null,
        },
        "*",
        undefined,
        token
    );

    if (!subscription) {
        return null;
    }

    return mapSubscription(subscription, await loadSubscriptionProduct(subscription.product_id, token));
}
