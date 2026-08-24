import { apiRequest } from "../client";
import { getAuthorizedHeaders } from "@/lib/api/auth";

export type AppRole = "student" | "teacher" | "admin";

export type AccessProfile = {
    primaryRole: AppRole;
    roles: AppRole[];
    allowedSurfaces: AppRole[];
    permissions: string[];
};

export function getCurrentAccessProfile() {
    return apiRequest<AccessProfile>("/auth/me/access", {
        method: "GET",
        headers: getAuthorizedHeaders(),
    });
}
