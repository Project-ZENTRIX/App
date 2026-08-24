import type { AccessProfile, AppRole } from "@/lib/api/endpoints/access-api";

export type AppSurface = AppRole;

const legacyStudentPaths: Array<[RegExp, string]> = [
    [/^\/app\/courses(\/.*)?$/, "/app/student/courses"],
    [/^\/app\/library(\/.*)?$/, "/app/student/library"],
    [/^\/app\/membership(\/.*)?$/, "/app/student/membership"],
    [/^\/app\/orders(\/.*)?$/, "/app/student/orders"],
    [/^\/app\/progress(\/.*)?$/, "/app/student/progress"],
    [/^\/app\/devices(\/.*)?$/, "/app/student/devices"],
];

const legacyTeacherPaths: Array<[RegExp, string]> = [[/^\/app\/content-packs(\/.*)?$/, "/app/teacher/content-packs"]];

function redirectLegacyPath(pathname: string, entries: Array<[RegExp, string]>, canonicalSurface: AppSurface) {
    for (const [pattern, target] of entries) {
        const match = pathname.match(pattern);
        if (!match) {
            continue;
        }

        const suffix = match[1] ?? "";
        return { canonicalSurface, target: `${target}${suffix}` };
    }

    return null;
}

export function getPreferredAppSurface(profile: Pick<AccessProfile, "primaryRole" | "allowedSurfaces"> | null | undefined) {
    if (!profile) {
        return "student";
    }

    if (profile.allowedSurfaces.includes(profile.primaryRole)) {
        return profile.primaryRole;
    }

    return profile.allowedSurfaces[0] ?? "student";
}

export function isSurfaceAllowed(surface: AppSurface, profile: Pick<AccessProfile, "allowedSurfaces"> | null | undefined) {
    if (!profile) {
        return surface === "student";
    }

    return profile.allowedSurfaces.includes(surface);
}

export function resolveAppSurface(pathname: string): AppSurface | null {
    if (pathname.startsWith("/app/student")) {
        return "student";
    }

    if (pathname.startsWith("/app/teacher")) {
        return "teacher";
    }

    if (pathname.startsWith("/app/admin")) {
        return "admin";
    }

    return null;
}

export function resolveCanonicalAppPath(
    pathname: string,
    profile: Pick<AccessProfile, "primaryRole" | "allowedSurfaces"> | null | undefined
) {
    const preferredSurface = getPreferredAppSurface(profile);

    if (pathname.startsWith("/app/student/settings")) {
        return `/app/settings${pathname.slice("/app/student/settings".length)}`;
    }

    const currentSurface = resolveAppSurface(pathname);
    if (currentSurface) {
        return isSurfaceAllowed(currentSurface, profile) ? null : `/app/${preferredSurface}`;
    }

    if (pathname === "/app") {
        return `/app/${preferredSurface}`;
    }

    const studentRedirect = redirectLegacyPath(pathname, legacyStudentPaths, "student");
    if (studentRedirect) {
        return isSurfaceAllowed("student", profile) ? studentRedirect.target : `/app/${preferredSurface}`;
    }

    const teacherRedirect = redirectLegacyPath(pathname, legacyTeacherPaths, "teacher");
    if (teacherRedirect) {
        return isSurfaceAllowed("teacher", profile) ? teacherRedirect.target : `/app/${preferredSurface}`;
    }

    return null;
}

export function surfaceLabel(surface: AppSurface, locale: "zh-CN" | "en-GB") {
    if (surface === "student") {
        return locale === "zh-CN" ? "学生端" : "Student";
    }

    if (surface === "teacher") {
        return locale === "zh-CN" ? "教师端" : "Teacher";
    }

    return locale === "zh-CN" ? "管理员端" : "Admin";
}
