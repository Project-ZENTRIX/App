const assert = require("node:assert/strict");
const test = require("node:test");

const { AuthLicenseService } = require("../dist/auth/auth-license.service.js");
const { createMockSupabase } = require("./helpers/mock-supabase.js");

function createService() {
    const supabase = createMockSupabase();
    return { supabase, service: new AuthLicenseService(supabase) };
}

test("getLicenseOverview creates a Supabase license summary for the current user", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner", password: "passw0rd!" });
    supabase.seed.license({
        id: "license-1",
        userId: "user-1",
        licenseKey: "license-key-1",
        maxDevices: 2,
        maxPrimaryDevices: 1,
    });

    const result = await service.getLicenseOverview("Bearer token-user-1");

    assert.ok(result.license);
    assert.equal(result.license.licenseKey, "license-key-1");
    assert.equal(result.license.deviceCount, 0);
    assert.equal(result.license.primaryDeviceCount, 0);
});

test("lists device bindings and unbinds a device through Supabase tables", async () => {
    const { supabase, service } = createService();
    supabase.seed.user({ id: "user-1", email: "learner@example.com", name: "Learner", password: "passw0rd!" });
    supabase.seed.device({
        id: "device-1",
        userId: "user-1",
        deviceKey: "device-key-1",
        name: "Desktop",
        platform: "windows",
    });
    supabase.seed.license({
        id: "license-1",
        userId: "user-1",
        licenseKey: "license-key-1",
        maxDevices: 2,
    });
    supabase.seed.deviceBinding({
        id: "binding-1",
        userId: "user-1",
        desktopLicenseId: "license-1",
        deviceId: "device-1",
        bindingKey: "binding-key-1",
    });

    const bindings = await service.listDeviceBindings("Bearer token-user-1");
    const result = await service.unbindDeviceByDeviceId("device-1", "Bearer token-user-1");

    assert.equal(bindings.items.length, 1);
    assert.equal(bindings.items[0].desktopLicense.licenseKey, "license-key-1");
    assert.equal(result.success, true);
    assert.equal(supabase.state.deviceBindings[0].deleted_at !== null, true);
    assert.equal(supabase.state.licenseEvents.at(-1).event_type, "device_unbound");
});
