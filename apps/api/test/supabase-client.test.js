const assert = require("node:assert/strict");
const test = require("node:test");

const { SupabaseClient } = require("../dist/common/supabase/supabase.client.js");

function createResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json",
        },
    });
}

test("signInWithPassword posts to the Supabase auth token endpoint", async () => {
    const requests = [];
    const client = new SupabaseClient(
        {
            baseUrl: "https://supabase.test",
            anonKey: "anon-key",
            serviceRoleKey: "service-key",
        },
        async (url, init) => {
            requests.push({ url, init });
            return createResponse({
                access_token: "access-token-123",
                refresh_token: "refresh-token-123",
                user: {
                    id: "user-1",
                    email: "learner@example.com",
                    created_at: "2026-08-20T00:00:00.000Z",
                    updated_at: "2026-08-20T00:00:00.000Z",
                },
            });
        }
    );

    const result = await client.signInWithPassword("learner@example.com", "passw0rd!");

    assert.equal(requests[0].url, "https://supabase.test/auth/v1/token?grant_type=password");
    assert.equal(requests[0].init.method, "POST");
    assert.equal(requests[0].init.headers.apikey, "anon-key");
    assert.equal(result.access_token, "access-token-123");
    assert.equal(result.user.email, "learner@example.com");
});

test("signUpWithPassword normalizes signup responses with top-level tokens", async () => {
    const requests = [];
    const client = new SupabaseClient(
        {
            baseUrl: "https://supabase.test",
            anonKey: "anon-key",
            serviceRoleKey: "service-key",
        },
        async (url, init) => {
            requests.push({ url, init });
            return createResponse({
                access_token: "signup-access-token-123",
                refresh_token: "signup-refresh-token-123",
                user: {
                    id: "user-1",
                    email: "learner@example.com",
                    created_at: "2026-08-20T00:00:00.000Z",
                    updated_at: "2026-08-20T00:00:00.000Z",
                },
            });
        }
    );

    const result = await client.signUpWithPassword("learner@example.com", "passw0rd!", {
        name: "Learner",
    });

    assert.equal(requests[0].url, "https://supabase.test/auth/v1/signup");
    assert.equal(requests[0].init.method, "POST");
    assert.equal(requests[0].init.headers.apikey, "anon-key");
    assert.equal(result.session?.access_token, "signup-access-token-123");
    assert.equal(result.session?.refresh_token, "signup-refresh-token-123");
    assert.equal(result.user.email, "learner@example.com");
});

test("selectRows reads rows from a Supabase schema", async () => {
    const requests = [];
    const client = new SupabaseClient(
        {
            baseUrl: "https://supabase.test",
            anonKey: "anon-key",
            serviceRoleKey: "service-key",
        },
        async (url, init) => {
            requests.push({ url, init });
            return createResponse([
                {
                    id: "course-1",
                    title: "Course 1",
                },
            ]);
        }
    );

    const rows = await client.selectRows("public", "courses", { status: "published" }, "id,title");

    assert.equal(requests[0].url, "https://supabase.test/rest/v1/courses?select=id%2Ctitle&status=eq.published");
    assert.equal(requests[0].init.headers.Authorization, "Bearer service-key");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, "Course 1");
});
