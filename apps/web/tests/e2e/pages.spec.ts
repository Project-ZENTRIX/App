import { expect, test, type Page } from "@playwright/test";
import { apiUrl, createTestEmail, createTestPassword, expectApiOk } from "./helpers/api";
import { assignSupabaseUserRole, createSupabaseTestAccount } from "./helpers/supabase";

function collectRequests(page: Page) {
    const urls: string[] = [];
    page.on("request", (request) => {
        urls.push(request.url());
    });

    return urls;
}

function hasUnexpectedBackendRequest(urls: string[]) {
    return urls.some((url) => url.includes("127.20.0.1:4000/api") && !url.includes("/auth/me/access"));
}

async function signInThroughUi(page: Page, email: string, password: string) {
    await page.goto("/account/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.locator('section[id="_zentrix.comp-content"] button[type="submit"]').click();
    await expect(page).toHaveURL(/\/app(\/.*)?$/);
}

test.describe("Web pages end to end", () => {
    test("renders the landing and pricing pages", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "Project ZENTRIX" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Read FAQ" })).toBeVisible();

        await page.goto("/pricing");
        await expect(page.getByRole("heading", { name: "View our affordable pricing" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Choose Cyrum" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "Cyrum" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Comparing plans" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Recommended by learners" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Featured authors" })).toBeVisible();
    });

    test("renders the forgot password page", async ({ page }) => {
        await page.goto("/account/forgot-password");
        await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Back to sign in" })).toBeVisible();
    });

    test("renders the Chinese landing and auth copy", async ({ page }) => {
        const email = createTestEmail("zh");
        const password = createTestPassword();

        await page.context().addCookies([
            {
                name: "zentrix-locale",
                value: "zh-CN",
                url: "http://127.20.0.1:3000",
            },
        ]);

        await page.goto("/");
        await expect(page.getByRole("button", { name: "立即开始" })).toBeVisible();
        await expect(page.getByRole("link", { name: "查看 FAQ" })).toBeVisible();
        const hero = page.locator('section[id="_zentrix.comp-content"]');
        await expect(hero).toContainText("学编程");
        await expect(hero).toContainText("讲实战");

        await page.goto("/account/signup");
        await expect(page.getByLabel("邮箱")).toBeVisible();
        await expect(page.getByLabel("密码", { exact: true })).toBeVisible();
        await expect(page.getByLabel("确认密码")).toBeVisible();
        await expect(page.getByText("我们会用这个邮箱联系你，不会向其他人公开。")).toBeVisible();
        await expect(page.getByText("密码至少需要 8 个字符。")).toBeVisible();
        await expect(page.getByText("已经有账号了？")).toBeVisible();
        await expect(page.getByText("点击继续，即表示你同意我们的")).toBeVisible();

        await page.getByLabel("邮箱").fill(email);
        await page.getByLabel("密码", { exact: true }).fill(password);
        await page.getByLabel("确认密码").fill(password);
        await page.getByRole("button", { name: "创建账号" }).click();
        await expect(page).toHaveURL(/\/account\/login$/);

        await expect(page.getByLabel("邮箱")).toBeVisible();
        await expect(page.getByLabel("密码", { exact: true })).toBeVisible();
        await expect(page.getByText("还没有账号？")).toBeVisible();

        await page.getByLabel("邮箱").fill(email);
        await page.getByLabel("密码", { exact: true }).fill(password);
        await page.locator('section[id="_zentrix.comp-content"] button[type="submit"]').click();
        await expect(page).toHaveURL(/\/app$/);
        await expect(page.getByRole("link", { name: "课程库" }).first()).toBeVisible();
    });

    test("renders the FAQ page", async ({ page }) => {
        await page.goto("/faq");
        await expect(page.getByRole("heading", { name: "FAQ and support basics" })).toBeVisible();
        await expect(page.getByText("How do purchases work?")).toBeVisible();
        await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    });

    test("allows a learner to create an account and sign in through the UI", async ({ page }) => {
        const email = createTestEmail("ui");
        const password = createTestPassword();

        await page.goto("/account/signup");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").first().fill(password);
        await page.getByLabel("Confirm Password").fill(password);
        await page.getByRole("button", { name: "Create Account" }).click();
        await expect(page).toHaveURL(/\/account\/login$/);

        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(password);
        await page.locator('section[id="_zentrix.comp-content"] button[type="submit"]').click();
        await expect(page).toHaveURL(/\/app$/);
        await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
    });

    test("shows the authenticated dashboard and settings surfaces", async ({ page, request }) => {
        const email = createTestEmail("page");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await signInThroughUi(page, email, password);

        const requestUrls = collectRequests(page);

        await page.goto("/app/student");
        await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
        await expect(page.getByRole("main").getByText(email, { exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "Profile", exact: true }).first()).toBeVisible();
        await expect(page.getByRole("link", { name: "Security", exact: true }).first()).toBeVisible();
        await expect(page.locator("aside").getByRole("link", { name: "Settings", exact: true })).toHaveCount(0);

        await page.goto("/app/settings/profile");
        const settingsNav = page.getByRole("navigation", { name: "Settings" });
        await expect(settingsNav).toBeVisible();
        await expect(settingsNav.getByRole("link", { name: "Profile" })).toHaveAttribute("aria-current", "page");
        await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Profile" }).first()).toBeVisible();
        await page.getByLabel("Name").fill("UI Test Learner");
        await page.getByLabel("Avatar URL").fill("https://example.com/avatar.png");
        await page.getByLabel("Bio").fill("Updated from Playwright");
        await page.getByRole("button", { name: "Save profile" }).click();
        await expect(page.getByText("Profile updated")).toBeVisible();
        await expect(page.getByRole("button", { name: "Save profile" })).toBeVisible();

        await settingsNav.getByRole("link", { name: "Notifications" }).click();
        await expect(page).toHaveURL(/\/app\/settings\/notifications$/);
        await expect(settingsNav.getByRole("link", { name: "Notifications" })).toHaveAttribute("aria-current", "page");
        await expect(page.getByRole("navigation", { name: "Settings" })).toBeVisible();
        await page.getByLabel("Email notifications").click();
        await page.getByRole("button", { name: "Save settings" }).click();
        await expect(page.getByText("Notification settings saved")).toBeVisible();

        await page.reload();
        await expect(page.getByLabel("Email notifications")).not.toBeChecked();

        await settingsNav.getByRole("link", { name: "Security" }).click();
        await expect(page).toHaveURL(/\/app\/settings\/security$/);
        await expect(
            page.getByRole("navigation", { name: "Settings" }).getByRole("link", { name: "Security" })
        ).toHaveAttribute("aria-current", "page");
        await page.getByLabel("Current password").fill(password);
        await page.getByLabel("New password", { exact: true }).fill("ZentrixPass789!");
        await page.getByLabel("Confirm new password").fill("ZentrixPass789!");
        await page.getByRole("button", { name: "Update password" }).click();
        await expect(page.getByRole("button", { name: "Update password" })).toBeVisible();
        expect(hasUnexpectedBackendRequest(requestUrls)).toBe(false);

        await settingsNav.getByRole("link", { name: "Sessions" }).click();
        await expect(page).toHaveURL(/\/app\/settings\/sessions$/);
        await expect(
            page.getByRole("navigation", { name: "Settings" }).getByRole("link", { name: "Sessions" })
        ).toHaveAttribute("aria-current", "page");
        const revokeButtons = page.getByRole("button", { name: "Revoke session" });
        const buttonCount = await revokeButtons.count();
        if (buttonCount > 0) {
            await revokeButtons.first().click();
            await expect(revokeButtons).toHaveCount(buttonCount - 1);
        }
    });

    test("renders the catalog, details, and owned course surfaces", async ({ page, request }) => {
        const email = createTestEmail("catalog");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await signInThroughUi(page, email, password);

        await page.goto("/app/student/courses");
        await expect(page.locator("h1").filter({ hasText: "Course market" })).toBeVisible();
        await expect(page.getByRole("link", { name: /View details/ }).first()).toBeVisible();
        await expect(page.getByRole("button", { name: "Popular" })).toBeVisible();

        await page.goto("/app/student/courses/course-api-design");
        await expect(page.getByRole("heading", { name: "API 设计与后端契约课包" })).toBeVisible();
        await expect(page.getByText("Learning status")).toBeVisible();
        await expect(page.getByText("Chapter preview")).toBeVisible();
        await expect(page.getByRole("link", { name: "Continue learning" })).toBeVisible();

        await page.goto("/app/student/library");
        await expect(page.locator("h1").filter({ hasText: "My Courses" })).toBeVisible();
        await expect(page.getByText("Owned and learnable packages")).toBeVisible();
        await expect(page.getByRole("link", { name: "Open details" }).first()).toBeVisible();
    });

    test("renders content pack API surfaces and snapshots", async ({ page, request }) => {
        const email = createTestEmail("content-pack");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await assignSupabaseUserRole(request, signup.user.id, "teacher");
        await signInThroughUi(page, email, password);

        const requestUrls = collectRequests(page);

        await page.goto("/app/teacher/content-packs");
        await expect(page.getByRole("heading", { name: "Content packs", level: 1 })).toBeVisible();
        await expect(page.getByRole("link", { name: "Open snapshot" }).first()).toBeVisible();
        await expect(page.getByText("Supabase S3")).toBeVisible();

        await page.goto("/app/teacher/content-packs/ai-foundation-demo");
        await expect(page.getByRole("heading", { name: "AI 基础入门模拟课包" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Published" })).toBeVisible();
        await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Manifest" }).first()).toBeVisible();
        await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Role plan" }).first()).toBeVisible();
        await expect(page.locator('[data-slot="card-description"]').filter({ hasText: "content-packs" }).first()).toBeVisible();

        expect(requestUrls.some((url) => url.includes("/api/content-packs"))).toBe(true);
    });

    test("redirects teachers away from admin and shows permitted surface switches", async ({ page, request }) => {
        const email = createTestEmail("teacher-admin");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await assignSupabaseUserRole(request, signup.user.id, "teacher");
        await signInThroughUi(page, email, password);

        await page.goto("/app/admin");
        await expect(page).toHaveURL(/\/app\/teacher$/);
        await expect(page.getByRole("heading", { name: "Teacher workspace" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Student", exact: true })).toBeVisible();
        await expect(page.locator("aside").getByRole("link", { name: "Settings", exact: true })).toHaveCount(0);
    });

    test("keeps settings out of the admin sidebar", async ({ page, request }) => {
        const email = createTestEmail("admin-settings");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await assignSupabaseUserRole(request, signup.user.id, "admin");
        await signInThroughUi(page, email, password);

        await page.goto("/app/admin");
        await expect(page).toHaveURL(/\/app\/admin$/);
        await expect(page.getByRole("heading", { name: "Admin centre" })).toBeVisible();
        await expect(page.locator("aside").getByRole("link", { name: "Settings", exact: true })).toHaveCount(0);
    });

    test("loads order payment status through Supabase REST instead of the backend API", async ({ page, request }) => {
        const email = createTestEmail("order-status");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);

        const createOrderResponse = await request.post(apiUrl("/orders"), {
            headers: {
                Authorization: `Bearer ${signup.token}`,
            },
            data: {
                items: [{ productId: "product-api-design" }],
            },
        });
        const createOrderBody = await createOrderResponse.text();
        expect(
            createOrderResponse.ok(),
            `order should be created: ${createOrderResponse.status()} ${createOrderBody}`
        ).toBeTruthy();
        const createOrder = JSON.parse(createOrderBody) as { success: boolean; message: string; data: { id: string } };
        const orderId = createOrder.data.id;

        await signInThroughUi(page, email, password);

        const requestUrls = collectRequests(page);

        await page.goto(`/app/orders/${orderId}`);
        await expect(page.getByRole("heading", { name: "Order detail" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Pay now" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Cancel order" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Payment status" })).toBeVisible();
        await expect(
            page
                .locator("div.rounded-xl.border.p-4")
                .filter({ has: page.getByRole("heading", { name: "Payment status" }) })
                .getByText("initiated")
        ).toBeVisible();

        requestUrls.length = 0;
        await page.reload();

        await expect(page.getByRole("heading", { name: "Payment status" })).toBeVisible();
        await expect(
            page
                .locator("div.rounded-xl.border.p-4")
                .filter({ has: page.getByRole("heading", { name: "Payment status" }) })
                .getByText("initiated")
        ).toBeVisible();
        expect(hasUnexpectedBackendRequest(requestUrls)).toBe(false);
    });

    test("renders commerce, license, and progress surfaces", async ({ page, request }) => {
        const email = createTestEmail("commerce");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await signInThroughUi(page, email, password);

        await page.goto("/app/membership");
        await expect(page.locator("h1").filter({ hasText: "Membership centre" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Refresh status" })).toBeVisible();

        await page.goto("/app/orders");
        await expect(page.locator("h1").filter({ hasText: "Order centre" })).toBeVisible();
        await expect(page.getByText("No orders yet")).toBeVisible();

        await page.goto("/app/devices");
        await expect(page.locator("h1").filter({ hasText: "Device & licence" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Reload devices" })).toBeVisible();

        await page.goto("/app/progress");
        await expect(page.locator("h1").filter({ hasText: "Achievements & progress" })).toBeVisible();
        await expect(page.getByText("Learning summary")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Achievements", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Levels", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Last sync", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Related courses", exact: true })).toBeVisible();
    });

    test("loads read-only learning pages through Supabase REST instead of the backend API", async ({ page, request }) => {
        const email = createTestEmail("supabase");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await signInThroughUi(page, email, password);

        const requestUrls = collectRequests(page);

        await page.goto("/app/student/courses");
        await expect(page.locator("h1").filter({ hasText: "Course market" })).toBeVisible();

        await page.goto("/app/student/library");
        await expect(page.locator("h1").filter({ hasText: "My Courses" })).toBeVisible();

        await page.goto("/app/student/progress");
        await expect(page.locator("h1").filter({ hasText: "Achievements & progress" })).toBeVisible();

        expect(hasUnexpectedBackendRequest(requestUrls)).toBe(false);
    });

    test("loads commerce and license read paths through Supabase REST instead of the backend API", async ({
        page,
        request,
    }) => {
        const email = createTestEmail("commerce-supabase");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);
        await signInThroughUi(page, email, password);

        const requestUrls = collectRequests(page);

        await page.goto("/app/student/membership");
        await expect(page.locator("h1").filter({ hasText: "Membership centre" })).toBeVisible();

        await page.goto("/app/student/orders");
        await expect(page.locator("h1").filter({ hasText: "Order centre" })).toBeVisible();

        await page.goto("/app/student/devices");
        await expect(page.locator("h1").filter({ hasText: "Device & licence" })).toBeVisible();
        await page.waitForLoadState("networkidle");

        expect(hasUnexpectedBackendRequest(requestUrls)).toBe(false);
    });
});
