const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SupabaseRequestOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PATCH";
  query?: string;
};

export class SupabaseConfigError extends Error {}

export async function supabaseRest<T>(path: string, options: SupabaseRequestOptions = {}) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new SupabaseConfigError("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}${options.query ?? ""}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    method: options.method ?? "GET"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase REST ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
}
