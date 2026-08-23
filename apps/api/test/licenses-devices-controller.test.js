const assert = require("node:assert/strict");
const test = require("node:test");

const { DevicesController } = require("../dist/devices/devices.controller.js");
const { LicensesController } = require("../dist/licenses/licenses.controller.js");

test("licenses controller proxies license routes to the license service", () => {
    const calls = [];
    const controller = new LicensesController({
        getLicenseOverview: (authorization) => {
            calls.push(["current", authorization]);
            return { license: null };
        },
        getLicenseHistory: (authorization) => {
            calls.push(["history", authorization]);
            return { licenses: [] };
        },
        listLicenseEvents: (authorization) => {
            calls.push(["events", authorization]);
            return { events: [] };
        },
    });

    assert.deepEqual(controller.getCurrentLicense("Bearer token-123"), { license: null });
    assert.deepEqual(controller.getLicenseHistory("Bearer token-123"), { licenses: [] });
    assert.deepEqual(controller.listLicenseEvents("Bearer token-123"), { events: [] });
    assert.deepEqual(calls, [
        ["current", "Bearer token-123"],
        ["history", "Bearer token-123"],
        ["events", "Bearer token-123"],
    ]);
});

test("devices controller proxies device and binding routes to the license service", () => {
    const calls = [];
    const controller = new DevicesController({
        listDevices: (authorization) => {
            calls.push(["devices", authorization]);
            return { devices: [] };
        },
        getDevice: (deviceId, authorization) => {
            calls.push(["device", deviceId, authorization]);
            return { device: null };
        },
        generateBindingCode: (deviceId, authorization) => {
            calls.push(["binding-code", deviceId, authorization]);
            return { bindingCode: "code", deviceId };
        },
        bindDevice: (body, authorization) => {
            calls.push(["bind", body, authorization]);
            return { binding: body };
        },
        unbindDeviceByDeviceId: (deviceId, authorization) => {
            calls.push(["unbind", deviceId, authorization]);
            return { success: true };
        },
        listDeviceBindings: (authorization) => {
            calls.push(["bindings", authorization]);
            return { items: [] };
        },
    });

    assert.deepEqual(controller.listDevices("Bearer token-123"), { devices: [] });
    assert.deepEqual(controller.getDevice("device-1", "Bearer token-123"), { device: null });
    assert.deepEqual(controller.generateBindingCode("device-1", "Bearer token-123"), {
        bindingCode: "code",
        deviceId: "device-1",
    });
    assert.deepEqual(
        controller.bindDevice({ deviceId: "device-1", bindingCode: "abc" }, "Bearer token-123"),
        { binding: { deviceId: "device-1", bindingCode: "abc" } }
    );
    assert.deepEqual(controller.unbindDevice("device-1", "Bearer token-123"), { success: true });
    assert.deepEqual(controller.listDeviceBindings("Bearer token-123"), { items: [] });
    assert.deepEqual(calls, [
        ["devices", "Bearer token-123"],
        ["device", "device-1", "Bearer token-123"],
        ["binding-code", "device-1", "Bearer token-123"],
        ["bind", { deviceId: "device-1", bindingCode: "abc" }, "Bearer token-123"],
        ["unbind", "device-1", "Bearer token-123"],
        ["bindings", "Bearer token-123"],
    ]);
});
