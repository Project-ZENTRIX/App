const assert = require("node:assert/strict");
const test = require("node:test");

const { AuthCoreService } = require("../dist/src/auth/auth-core.service.js");
const { hashPassword } = require("../dist/src/auth/auth-crypto.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

test("signUp creates a user, account and session", async () => {
    const prisma = createMockPrisma();
    const service = new AuthCoreService(prisma);

    const result = await service.signUp({
        email: "learner@example.com",
        password: "passw0rd!",
        confirmPassword: "passw0rd!",
    });

    assert.equal(result.user.email, "learner@example.com");
    assert.ok(result.token);
    assert.equal(prisma.state.users.length, 1);
    assert.equal(prisma.state.accounts.length, 1);
    assert.equal(prisma.state.sessions.length, 1);
});

test("signIn returns an existing session token for valid credentials", async () => {
    const prisma = createMockPrisma();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.account({
        id: "account-1",
        userId: "user-1",
        identifier: "learner@example.com",
        passwordHash: hashPassword("passw0rd!"),
    });
    const service = new AuthCoreService(prisma);

    const result = await service.signIn({
        email: "learner@example.com",
        password: "passw0rd!",
    });

    assert.equal(result.user.email, "learner@example.com");
    assert.ok(result.token);
    assert.equal(prisma.state.sessions.length, 1);
});

test("getCurrentAccount reads the bearer token from authorization headers", async () => {
    const prisma = createMockPrisma();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    const service = new AuthCoreService(prisma);

    const result = await service.getCurrentAccount("Bearer token-123");

    assert.equal(result.token, "token-123");
    assert.equal(result.user.email, "learner@example.com");
});

