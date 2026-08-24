const assert = require("node:assert/strict");
const test = require("node:test");

const { AuthCoreService } = require("../dist/auth/auth-core.service.js");
const { createMockSupabase } = require("./helpers/mock-supabase.js");

function createService() {
    const supabase = createMockSupabase();
    return { supabase, service: new AuthCoreService(supabase) };
}

test("signUp creates a Supabase auth user and returns the auth session token", async () => {
    const { supabase, service } = createService();

    const result = await service.signUp({
        email: "learner@example.com",
        password: "passw0rd!",
        confirmPassword: "passw0rd!",
    });

    assert.equal(result.user.email, "learner@example.com");
    assert.ok(result.token);
    assert.equal(supabase.state.users.length, 1);
    assert.equal(supabase.state.sessions.length, 1);
    assert.equal(supabase.state.profiles.length, 1);
});

test("signIn reads the current Supabase user session", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner", password: "passw0rd!" });

    const result = await service.signIn({
        email: "learner@example.com",
        password: "passw0rd!",
    });

    assert.equal(result.user.email, "learner@example.com");
    assert.ok(result.token);
    assert.equal(supabase.state.sessions.length, 1);
});

test("getCurrentAccount and updateProfile use the Supabase bearer token", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner", password: "passw0rd!" });

    const account = await service.getCurrentAccount("Bearer token-user-1");
    assert.equal(account.token, "token-user-1");
    assert.equal(account.user.name, "Learner");

    const updated = await service.updateProfile(
        {
            name: "Updated Learner",
            image: "https://example.com/avatar.png",
            bio: "learning with Supabase",
        },
        "Bearer token-user-1"
    );

    assert.equal(updated.user.name, "Updated Learner");
    assert.equal(updated.user.image, "https://example.com/avatar.png");
    assert.equal(supabase.state.profiles[0].bio, "learning with Supabase");
});

test("listSessions, revokeSession and updateNotificationPreferences work through Supabase tables", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner", password: "passw0rd!" });
    supabase.seed.session({
        id: "session-1",
        userId: "user-1",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });

    const sessions = await service.listSessions("Bearer token-user-1");
    assert.equal(sessions.sessions.length, 1);
    assert.equal(sessions.sessions[0].id, "session-1");

    const preferences = await service.updateNotificationPreferences(
        {
            email: false,
            sms: true,
            inApp: false,
        },
        "Bearer token-user-1"
    );
    assert.equal(preferences.sms, true);
    assert.equal(supabase.state.notificationPreferences[0].sms, true);

    await service.revokeSession("session-1", "Bearer token-user-1");
    assert.equal(supabase.state.sessions.length, 0);

    const audit = await service.getAuditRecords("Bearer token-user-1");
    assert.deepEqual(audit.records, []);
});

test("getAccessProfile defaults to the student surface and resolves explicit roles", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "student@example.com", name: "Student", password: "passw0rd!" });
    supabase.seed.userRole({ userId: "user-1", roleCode: "teacher" });
    supabase.seed.tenantMembership({ userId: "user-1", role: "admin", status: "active" });

    const accessProfile = await service.getAccessProfile("Bearer token-user-1");

    assert.equal(accessProfile.primaryRole, "admin");
    assert.deepEqual(accessProfile.roles, ["admin", "teacher"]);
    assert.deepEqual(accessProfile.allowedSurfaces, ["student", "teacher", "admin"]);
    assert.equal(accessProfile.permissions.includes("manage:tenant-scope"), true);
});

test("getAccessProfile falls back to the student surface when no roles are assigned", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "student@example.com", name: "Student", password: "passw0rd!" });

    const accessProfile = await service.getAccessProfile("Bearer token-user-1");

    assert.equal(accessProfile.primaryRole, "student");
    assert.deepEqual(accessProfile.roles, ["student"]);
    assert.deepEqual(accessProfile.allowedSurfaces, ["student"]);
    assert.equal(accessProfile.permissions.includes("read:student"), true);
});
