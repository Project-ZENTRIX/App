import { pbkdf2Sync, randomUUID, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string, salt = randomUUID()) {
    const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) {
        return false;
    }

    const candidate = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
    if (hash.length !== candidate.length) {
        return false;
    }

    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export function getTokenFromAuthorizationHeader(authorization?: string) {
    if (!authorization) {
        return null;
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
        return null;
    }

    return token;
}
