type SupabaseConfig = {
    baseUrl: string;
    anonKey: string;
    serviceRoleKey: string;
};

function readRequiredEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export function getSupabaseConfig(): SupabaseConfig {
    return {
        baseUrl: readRequiredEnv("SUPABASE_URL"),
        anonKey: readRequiredEnv("SUPABASE_ANON_KEY"),
        serviceRoleKey: readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    };
}

export type { SupabaseConfig };
