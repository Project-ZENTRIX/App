const assert = require("node:assert/strict");
const test = require("node:test");

const { AuthLicenseService } = require("../dist/src/auth/auth-license.service.js");
const { createMockPrisma } = require("./helpers/mock-prisma.js");

test("getLicenseOverview creates a license summary for the current user", async () => {
    const prisma = createMockPrisma();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.license({
        id: "license-1",
        userId: "user-1",
        licenseKey: "license-key-1",
        maxDevices: 2,
        maxPrimaryDevices: 1,
    });
    const service = new AuthLicenseService(prisma);

    const result = await service.getLicenseOverview("Bearer token-123");

    assert.ok(result.license);
    assert.equal(result.license.licenseKey, "license-key-1");
    assert.equal(result.license.deviceCount, 0);
    assert.equal(result.license.primaryDeviceCount, 0);
});

test("lists device bindings and unbinds a device by device id", async () => {
    const prisma = createMockPrisma();
    prisma.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner" });
    prisma.seed.session({
        id: "session-1",
        userId: "user-1",
        token: "token-123",
        expiresAt: new Date("2026-08-20T00:00:00.000Z").toISOString(),
    });
    prisma.seed.device({
        id: "device-1",
        userId: "user-1",
        deviceKey: "device-key-1",
        name: "Desktop",
        platform: "windows",
    });
    prisma.seed.license({
        id: "license-1",
        userId: "user-1",
        licenseKey: "license-key-1",
        maxDevices: 2,
    });
    prisma.seed.deviceBinding({
        id: "binding-1",
        userId: "user-1",
        desktopLicenseId: "license-1",
        deviceId: "device-1",
        bindingKey: "binding-key-1",
    });
    const service = new AuthLicenseService(prisma);

    const bindings = await service.listDeviceBindings("Bearer token-123");
    const result = await service.unbindDeviceByDeviceId("device-1", "Bearer token-123");

    assert.equal(bindings.items.length, 1);
    assert.equal(bindings.items[0].desktopLicense.licenseKey, "license-key-1");
    assert.equal(result.success, true);
    assert.equal(prisma.state.deviceBindings[0].deletedAt !== null, true);
    assert.equal(prisma.state.licenseEvents.at(-1).eventType, "device_unbound");
});
