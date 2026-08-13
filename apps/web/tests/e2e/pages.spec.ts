import { expect, test } from "@playwright/test";
import { createTestEmail, createTestPassword, expectApiOk, apiUrl } from "./helpers/api";

test.describe("Web pages end to end", () => {
    test("renders the landing and pricing pages", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "Project ZENTRIX" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();

        await page.goto("/pricing");
        await expect(page.getByRole("heading", { name: "View Our Affordable Pricing" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Choose Cyrum" })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: "Cyrum" })).toBeVisible();
        await expect(page.getByText("Comparing Plans")).toBeVisible();
    });

    test("allows a learner to create an account and sign in through the UI", async ({ page, request }) => {
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
        await expect(page.getByRole("heading", { name: "Personal Settings" })).toBeVisible();
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
        await page.getByLabel("SMS notifications").click();
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
});
