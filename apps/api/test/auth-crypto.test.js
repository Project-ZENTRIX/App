const assert = require("node:assert/strict");
const test = require("node:test");

const {
    getTokenFromAuthorizationHeader,
    hashPassword,
    verifyPassword,
} = require("../dist/src/auth/auth-crypto.js");

test("hashPassword and verifyPassword round-trip", () => {
    const stored = hashPassword("passw0rd!");
    assert.equal(verifyPassword("passw0rd!", stored), true);
    assert.equal(verifyPassword("wrong-pass", stored), false);
});

test("getTokenFromAuthorizationHeader parses bearer tokens", () => {
    assert.equal(getTokenFromAuthorizationHeader("Bearer token-123"), "token-123");
    assert.equal(getTokenFromAuthorizationHeader("Basic token-123"), null);
    assert.equal(getTokenFromAuthorizationHeader(undefined), null);
});

