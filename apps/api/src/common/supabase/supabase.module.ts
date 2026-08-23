import { Module } from "@nestjs/common";
import { createSupabaseClient } from "./supabase.client.js";
import { getSupabaseConfig } from "./supabase-config.js";

export const SUPABASE_CLIENT = Symbol("SUPABASE_CLIENT");

@Module({
    providers: [
        {
            provide: SUPABASE_CLIENT,
            useFactory: () => createSupabaseClient(getSupabaseConfig()),
        },
    ],
    exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
