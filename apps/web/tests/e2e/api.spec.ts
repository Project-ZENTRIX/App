import { expect, test } from "@playwright/test";
import { apiUrl, createTestEmail, createTestPassword, expectApiOk } from "./helpers/api";
import { createSupabaseTestAccount } from "./helpers/supabase";

test.describe("API end to end", () => {
    test("supports sign up, sign in, and account lookup", async ({ request }) => {
        const email = createTestEmail("auth");
        const password = createTestPassword();

        const signup = await createSupabaseTestAccount(request, email, password);

        expect(signup.user.email).toBe(email);
        expect(signup.token).toBeTruthy();

        const signin = await expectApiOk<{ token: string; user: { id: string; email: string } }>(
            request.post(apiUrl("/auth/signin"), {
                data: { email, password },
            }),
            "sign in should succeed"
        );

        expect(signin.user.id).toBe(signup.user.id);

        const currentAccount = await expectApiOk<{ token: string; user: { id: string; email: string } }>(
            request.get(apiUrl("/auth/me"), {
                headers: { Authorization: `Bearer ${signin.token}` },
            }),
            "current account should be available"
        );

        expect(currentAccount.user.email).toBe(email);
    });

    test("covers account, profile, security, session, notification, audit, and license routes", async ({ request }) => {
        const email = createTestEmail("account");
        const password = createTestPassword();
        const missingDeviceId = "00000000-0000-0000-0000-000000000000";

        const signup = await createSupabaseTestAccount(request, email, password);

        const token = signup.token;

        const me = await expectApiOk<{ token: string; user: { id: string; email: string } }>(
            request.get(apiUrl("/auth/me"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "account lookup should succeed"
        );
        expect(me.user.email).toBe(email);

        const profile = await expectApiOk<{
            user: {
                id: string;
                name: string;
                image: string | null;
                userProfile: { bio: string | null; avatarUrl: string | null } | null;
            };
        }>(
            request.get(apiUrl("/auth/me/profile"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "profile should load"
        );
        expect(profile.user.id).toBe(signup.user.id);

        const updatedProfile = await expectApiOk<{
            user: {
                id: string;
                name: string;
                image: string | null;
                userProfile: { bio: string | null; avatarUrl: string | null } | null;
            };
        }>(
            request.patch(apiUrl("/auth/me/profile"), {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    name: "Zentrix Explorer",
                    image: "https://example.com/avatar.png",
                    bio: "Testing profile updates",
                },
            }),
            "profile update should succeed"
        );
        expect(updatedProfile.user.name).toBe("Zentrix Explorer");
        expect(updatedProfile.user.userProfile?.bio).toBe("Testing profile updates");

        const notificationPreferences = await expectApiOk<{ email: boolean; sms: boolean; inApp: boolean }>(
            request.get(apiUrl("/auth/me/notification-preferences"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "notification preferences should load"
        );
        expect(notificationPreferences).toEqual({ email: true, sms: false, inApp: true });

        const updatedNotificationPreferences = await expectApiOk<{ email: boolean; sms: boolean; inApp: boolean }>(
            request.patch(apiUrl("/auth/me/notification-preferences"), {
                headers: { Authorization: `Bearer ${token}` },
                data: { email: false, sms: true, inApp: false },
            }),
            "notification preferences should update"
        );
        expect(updatedNotificationPreferences).toEqual({ email: false, sms: true, inApp: false });

        const sessions = await expectApiOk<{ sessions: Array<{ id: string; token: string }> }>(
            request.get(apiUrl("/auth/me/sessions"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "sessions should list"
        );
        expect(sessions.sessions.length).toBeGreaterThan(0);

        await expectApiOk<{ success: true }>(
            request.delete(apiUrl(`/auth/me/sessions/${sessions.sessions[0]?.id}`), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "session revoke should succeed"
        );

        await expectApiOk<{ success: true }>(
            request.patch(apiUrl("/auth/me/password"), {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    currentPassword: password,
                    newPassword: "ZentrixPass456!",
                },
            }),
            "password update should succeed"
        );

        const auditRecords = await expectApiOk<{ records: Array<{ action: string }> }>(
            request.get(apiUrl("/auth/me/audit-records"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "audit records should load"
        );
        expect(Array.isArray(auditRecords.records)).toBe(true);

        const license = await expectApiOk<{ license: { id: string; licenseKey: string } | null }>(
            request.get(apiUrl("/auth/me/license"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "license overview should load"
        );
        expect(license.license?.id).toBeTruthy();

        const licenseHistory = await expectApiOk<{ licenses: Array<{ id: string }> }>(
            request.get(apiUrl("/auth/me/license/history"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "license history should load"
        );
        expect(licenseHistory.licenses.length).toBeGreaterThan(0);

        const devices = await expectApiOk<{ devices: Array<{ id: string; bindingCount: number }> }>(
            request.get(apiUrl("/auth/me/license/devices"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "license devices should load"
        );
        expect(devices.devices).toEqual([]);

        const missingDevice = await expectApiOk<{ device: null }>(
            request.get(apiUrl(`/auth/me/license/devices/${missingDeviceId}`), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "missing device lookup should return null"
        );
        expect(missingDevice.device).toBeNull();

        const bindingCodeResponse = await request.post(apiUrl(`/auth/me/license/devices/${missingDeviceId}/binding-code`), {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(bindingCodeResponse.ok()).toBe(false);
        expect(bindingCodeResponse.status()).toBe(400);

        const bindResponse = await request.post(apiUrl("/auth/me/license/bindings"), {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                deviceId: missingDeviceId,
                bindingCode: "invalid",
            },
        });
        expect(bindResponse.ok()).toBe(false);
        expect(bindResponse.status()).toBe(400);

        const unbindResponse = await request.delete(apiUrl("/auth/me/license/bindings/00000000-0000-0000-0000-000000000001"), {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(unbindResponse.ok()).toBe(false);
        expect(unbindResponse.status()).toBe(400);

        const events = await expectApiOk<{ events: Array<{ eventType: string }> }>(
            request.get(apiUrl("/auth/me/license/events"), {
                headers: { Authorization: `Bearer ${token}` },
            }),
            "license events should load"
        );
        expect(Array.isArray(events.events)).toBe(true);

        const oauth = await expectApiOk<{ supported: true }>(request.post(apiUrl("/auth/oauth")), "oauth stub should respond");
        expect(oauth.supported).toBe(true);
    });

    test("covers the course catalog and nested content endpoints", async ({ request }) => {
        const courses = await expectApiOk<{
            items: Array<{ id: string; title: string; statusLabel: string; purchaseState: string }>;
            pagination: { page: number; pageSize: number; total: number; totalPages: number };
        }>(request.get(apiUrl("/courses")), "course list should load");
        expect(courses.items.length).toBeGreaterThan(0);

        const filteredCourses = await expectApiOk<{
            items: Array<{ id: string; title: string }>;
            pagination: { total: number };
        }>(request.get(apiUrl("/courses?keyword=API&pageSize=2")), "filtered course list should load");
        expect(filteredCourses.pagination.total).toBeGreaterThan(0);

        const course = await expectApiOk<{
            id: string;
            chapters: Array<{ id: string; lessonIds: string[] }>;
            releases: Array<{ id: string }>;
            versions: Array<{ version: string }>;
            includedAssets: Array<{ id: string }>;
        }>(request.get(apiUrl("/courses/course-api-design")), "course detail should load");
        expect(course.id).toBe("course-api-design");

        const chapters = await expectApiOk<{ courseId: string; items: Array<{ id: string }> }>(
            request.get(apiUrl("/courses/course-api-design/chapters")),
            "course chapters should load"
        );
        expect(chapters.items.length).toBeGreaterThan(0);

        const chapterLessons = await expectApiOk<{ chapterId: string; items: Array<{ id: string }> }>(
            request.get(apiUrl("/chapters/chapter-api-1/lessons")),
            "chapter lessons should load"
        );
        expect(chapterLessons.items.length).toBeGreaterThan(0);

        const lesson = await expectApiOk<{ id: string; title: string }>(
            request.get(apiUrl("/lessons/lesson-api-1")),
            "lesson should load"
        );
        expect(lesson.id).toBe("lesson-api-1");

        const task = await expectApiOk<{ id: string; title: string }>(
            request.get(apiUrl("/tasks/task-api-1")),
            "task should load"
        );
        expect(task.id).toBe("task-api-1");

        const asset = await expectApiOk<{ id: string; title: string }>(
            request.get(apiUrl("/content-assets/asset-api-1")),
            "content asset should load"
        );
        expect(asset.id).toBe("asset-api-1");

        const releases = await expectApiOk<{ courseId: string; items: Array<{ id: string }> }>(
            request.get(apiUrl("/courses/course-api-design/releases")),
            "course releases should load"
        );
        expect(releases.items.length).toBeGreaterThan(0);

        const versions = await expectApiOk<{ courseId: string; items: Array<{ version: string }> }>(
            request.get(apiUrl("/courses/course-api-design/versions")),
            "course versions should load"
        );
        expect(versions.items.length).toBeGreaterThan(0);
    });
});
