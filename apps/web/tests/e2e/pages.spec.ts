import { expect, test } from "@playwright/test";
import { apiUrl, createTestEmail, createTestPassword, expectApiOk } from "./helpers/api";

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

        const signup = await expectApiOk<{ token: string; user: { id: string } }>(
            request.post(apiUrl("/auth/signup"), {
                data: { email, password, confirmPassword: password },
            }),
            "seed account should be created"
        );

        await page.addInitScript((token) => {
            window.localStorage.setItem("zentrix-auth-token", token);
        }, signup.token);

        await page.goto("/app");
        await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
        await expect(page.getByRole("main").getByText(email, { exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "Profile", exact: true }).first()).toBeVisible();
        await expect(page.getByRole("link", { name: "Security", exact: true }).first()).toBeVisible();
        await expect(page.getByRole("link", { name: "Notifications", exact: true }).first()).toBeVisible();

        await page.goto("/app/settings/profile");
        await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Profile" }).first()).toBeVisible();
        await expect(page.getByRole("tab", { name: "Profile" })).toBeVisible();
        await page.getByLabel("Name").fill("UI Test Learner");
        await page.getByLabel("Avatar URL").fill("https://example.com/avatar.png");
        await page.getByLabel("Bio").fill("Updated from Playwright");
        const profileResponse = page.waitForResponse(
            (response) => response.url().endsWith("/api/auth/me/profile") && response.request().method() === "PATCH"
        );
        await page.getByRole("button", { name: "Save profile" }).click();
        const savedProfile = await profileResponse;
        expect(savedProfile.ok()).toBe(true);

        await page.goto("/app/settings/notifications");
        await expect(page.getByRole("tab", { name: "Notifications" })).toBeVisible();
        await page.getByLabel("Email notifications").click();
        await page.getByRole("button", { name: "Save settings" }).click();
        await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();

        await page.goto("/app/settings/security");
        await expect(page.getByRole("tab", { name: "Security" })).toBeVisible();
        await page.getByLabel("Current password").fill(password);
        await page.getByLabel("New password", { exact: true }).fill("ZentrixPass789!");
        await page.getByLabel("Confirm new password").fill("ZentrixPass789!");
        await page.getByRole("button", { name: "Update password" }).click();
        await expect(page.getByRole("button", { name: "Update password" })).toBeVisible();

        await page.goto("/app/settings/sessions");
        await expect(page.getByRole("tab", { name: "Sessions" })).toBeVisible();
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

        const signup = await expectApiOk<{ token: string }>(
            request.post(apiUrl("/auth/signup"), {
                data: { email, password, confirmPassword: password },
            }),
            "seed account should be created"
        );

        await page.addInitScript((token) => {
            window.localStorage.setItem("zentrix-auth-token", token);
        }, signup.token);

        await page.goto("/app/courses");
        await expect(page.locator("h1").filter({ hasText: "Course market" })).toBeVisible();
        await expect(page.getByRole("link", { name: /View details/ }).first()).toBeVisible();
        await expect(page.getByRole("button", { name: "Popular" })).toBeVisible();

        await page.goto("/app/courses/course-api-design");
        await expect(page.getByRole("heading", { name: "API 设计与后端契约课包" })).toBeVisible();
        await expect(page.getByText("Learning status")).toBeVisible();
        await expect(page.getByText("Chapter preview")).toBeVisible();
        await expect(page.getByRole("link", { name: "Continue learning" })).toBeVisible();

        await page.goto("/app/library");
        await expect(page.locator("h1").filter({ hasText: "My Courses" })).toBeVisible();
        await expect(page.getByText("Owned and learnable packages")).toBeVisible();
        await expect(page.getByRole("link", { name: "Open details" }).first()).toBeVisible();
    });

    test("lets a learner buy a course package and review the created order", async ({ page, request }) => {
        const email = createTestEmail("buy");
        const password = createTestPassword();

        const signup = await expectApiOk<{ token: string }>(
            request.post(apiUrl("/auth/signup"), {
                data: { email, password, confirmPassword: password },
            }),
            "seed account should be created"
        );

        await page.addInitScript((token) => {
            window.localStorage.setItem("zentrix-auth-token", token);
        }, signup.token);

        await page.goto("/app/courses/course-api-design");
        const buyButton = page.getByRole("button", { name: "Buy package" });
        await expect(buyButton).toBeVisible();
        await buyButton.click();

        await expect(page).toHaveURL(/\/app\/orders\/.+/);
        await expect(page.getByRole("heading", { name: "Order detail" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Pay now" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Cancel order" })).toBeVisible();
    });

    test("renders commerce, license, and progress surfaces", async ({ page, request }) => {
        const email = createTestEmail("commerce");
        const password = createTestPassword();

        const signup = await expectApiOk<{ token: string }>(
            request.post(apiUrl("/auth/signup"), {
                data: { email, password, confirmPassword: password },
            }),
            "seed account should be created"
        );

        await page.addInitScript((token) => {
            window.localStorage.setItem("zentrix-auth-token", token);
        }, signup.token);

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
        await expect(page.getByText("Achievements")).toBeVisible();
        await expect(page.getByText("Levels")).toBeVisible();
        await expect(page.getByText("Last sync")).toBeVisible();
        await expect(page.getByText("Related courses")).toBeVisible();
    });
});
