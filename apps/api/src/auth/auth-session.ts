import { SupabaseClient } from "../common/supabase/supabase.client.js";

export async function getSessionFromAuthorizationHeader(supabase: SupabaseClient, authorization?: string) {
    if (!authorization) {
        return null;
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
        return null;
    }

    return supabase.getCurrentUser(authorization);
}
