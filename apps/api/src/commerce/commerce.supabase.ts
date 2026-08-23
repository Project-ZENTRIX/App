import { SupabaseClient } from "../common/supabase/supabase.client.js";

export type CourseRow = {
    id: string;
    slug: string;
    title: string;
};

export type ProductRow = {
    id: string;
    course_id: string | null;
    code: string;
    name: string;
    description: string | null;
    status: string;
    price: string;
    currency: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type OrderRow = {
    id: string;
    user_id: string;
    order_no: string;
    status: string;
    total_amount: string;
    currency: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type OrderItemRow = {
    id: string;
    order_id: string;
    product_id: string | null;
    name: string;
    quantity: number;
    unit_price: string;
    created_at: string;
    deleted_at: string | null;
};

export type PaymentRow = {
    id: string;
    user_id: string;
    order_id: string | null;
    payment_no: string;
    status: string;
    amount: string;
    currency: string;
    provider: string | null;
    external_ref: string | null;
    gateway_txn_id: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type SubscriptionRow = {
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

export type ProductRecord = ProductRow & {
    course: CourseRow | null;
};

export type OrderRecord = OrderRow & {
    items: OrderItemRow[];
    payments: PaymentRow[];
};

export type SubscriptionRecord = SubscriptionRow & {
    product: { id: string; code: string; name: string } | null;
};

export function toDate(value: string | null) {
    return value ? new Date(value) : null;
}

export function toDateRequired(value: string) {
    return new Date(value);
}

export async function loadCourse(supabase: SupabaseClient, courseId: string) {
    return supabase.selectOne<CourseRow>("public", "courses", { id: courseId });
}

export async function loadProduct(supabase: SupabaseClient, productId: string) {
    const product = await supabase.selectOne<ProductRow>("public", "products", { id: productId });
    if (!product) {
        return null;
    }

    const course = product.course_id ? await loadCourse(supabase, product.course_id) : null;
    return {
        ...product,
        course,
    } satisfies ProductRecord;
}

export async function loadProducts(supabase: SupabaseClient) {
    const products = await supabase.selectRows<ProductRow>(
        "public",
        "products",
        {
            deleted_at: null,
        },
        "*",
        {
            column: "created_at",
            ascending: false,
        }
    );

    const courses = new Map<string, CourseRow | null>();
    await Promise.all(
        products
            .filter((product) => product.course_id)
            .map(async (product) => {
                courses.set(product.id, product.course_id ? await loadCourse(supabase, product.course_id) : null);
            })
    );

    return products.map(
        (product) =>
            ({
                ...product,
                course: courses.get(product.id) ?? null,
            }) satisfies ProductRecord
    );
}

export async function loadOrder(supabase: SupabaseClient, orderId: string, userId?: string) {
    const order = await supabase.selectOne<OrderRow>(
        "public",
        "orders",
        userId
            ? {
                  id: orderId,
                  user_id: userId,
                  deleted_at: null,
              }
            : {
                  id: orderId,
                  deleted_at: null,
              }
    );

    if (!order) {
        return null;
    }

    const [items, payments] = await Promise.all([
        supabase.selectRows<OrderItemRow>(
            "public",
            "order_items",
            {
                order_id: order.id,
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: true,
            }
        ),
        supabase.selectRows<PaymentRow>(
            "public",
            "payments",
            {
                order_id: order.id,
                deleted_at: null,
            },
            "*",
            {
                column: "created_at",
                ascending: false,
            }
        ),
    ]);

    return {
        ...order,
        items,
        payments,
    } satisfies OrderRecord;
}

export async function loadSubscription(supabase: SupabaseClient, subscriptionId: string, userId: string) {
    const subscription = await supabase.selectOne<SubscriptionRow>("public", "subscriptions", {
        id: subscriptionId,
        user_id: userId,
        deleted_at: null,
    });

    if (!subscription) {
        return null;
    }

    const product = subscription.product_id ? await loadProduct(supabase, subscription.product_id) : null;
    return {
        ...subscription,
        product: product ? { id: product.id, code: product.code, name: product.name } : null,
    } satisfies SubscriptionRecord;
}
