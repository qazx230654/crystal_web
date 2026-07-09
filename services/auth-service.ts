import { memberRepository } from "@/repositories/member-repository";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAuthKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const authAccessCookieName = "gooday_auth_access_token";
export const authRefreshCookieName = "gooday_auth_refresh_token";

export type MemberProfile = {
  created_at?: string;
  email: string;
  id: string;
  line_id?: string | null;
  name?: string | null;
  phone?: string | null;
  role?: "member" | "vip" | "admin" | string | null;
  status?: "active" | "disabled" | string | null;
  updated_at?: string;
  vip_tier?: string | null;
};

type SupabaseAuthUser = {
  email?: string;
  email_confirmed_at?: string | null;
  id: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAuthSession = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  token_type?: string;
  user?: SupabaseAuthUser;
};

export class SupabaseAuthConfigError extends Error {}

export function getAuthBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7);
  }

  return getCookieValue(request, authAccessCookieName);
}

export function getCookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;
}

export async function signUpMember(input: {
  email: string;
  lineId?: string;
  name: string;
  password: string;
  phone?: string;
}) {
  const payload = await supabaseAuthRequest<SupabaseAuthSession>("/signup", {
    body: {
      data: {
        line_id: input.lineId || null,
        name: input.name,
        phone: input.phone || null
      },
      email: input.email,
      password: input.password
    },
    method: "POST"
  });

  const user = payload.user;
  if (user?.id) {
    await saveMemberProfile({
      email: user.email || input.email,
      id: user.id,
      line_id: input.lineId || null,
      name: input.name,
      phone: input.phone || null
    }).catch((error) => {
      if (!isMissingProfilesTableError(error)) throw error;
    });
  }

  return payload;
}

export async function signInMember(email: string, password: string) {
  const payload = await supabaseAuthRequest<SupabaseAuthSession>("/token?grant_type=password", {
    body: { email, password },
    method: "POST"
  });

  if (payload.user?.id) {
    await ensureMemberProfile(payload.user).catch((error) => {
      if (!isMissingProfilesTableError(error)) throw error;
    });
  }

  return payload;
}

export async function resendSignupVerification(email: string) {
  return supabaseAuthRequest<{ message?: string }>("/resend", {
    body: {
      email,
      type: "signup"
    },
    method: "POST"
  });
}

export async function sendPasswordResetEmail(email: string, redirectTo: string) {
  return supabaseAuthRequest<{ message?: string }>(`/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    body: {
      email
    },
    method: "POST"
  });
}

export async function updatePassword(accessToken: string, password: string) {
  return supabaseAuthRequest<SupabaseAuthUser>("/user", {
    accessToken,
    body: { password },
    method: "PUT"
  });
}

export async function getCurrentMember(request: Request) {
  const token = getAuthBearerToken(request);
  if (!token) return null;

  const user = await getAuthUser(token);
  if (!user?.id) return null;

  const profile = await getMemberProfile(user.id).catch((error) => {
    if (isMissingProfilesTableError(error)) return null;
    throw error;
  });

  return {
    profile,
    user
  };
}

export async function isCurrentMemberAdmin(request: Request) {
  const member = await getCurrentMember(request);
  const profile = member?.profile;

  return Boolean(member?.user?.id && profile?.role === "admin" && (profile.status ?? "active") === "active");
}

export async function getAuthUser(accessToken: string) {
  return supabaseAuthRequest<SupabaseAuthUser>("/user", {
    accessToken,
    method: "GET"
  });
}

export async function getMemberProfile(id: string) {
  return memberRepository.getProfile(id);
}

export async function saveMemberProfile(profile: MemberProfile) {
  const existing = await getMemberProfile(profile.id).catch(() => null);
  const body = {
    email: profile.email,
    line_id: profile.line_id || null,
    name: profile.name || null,
    phone: profile.phone || null,
    updated_at: new Date().toISOString()
  };

  if (existing) {
    return memberRepository.updateProfile(profile.id, body);
  }

  return memberRepository.createProfile({
      ...body,
      id: profile.id,
      role: profile.role || "member",
      status: profile.status || "active",
      vip_tier: profile.vip_tier || null
  });
}

async function ensureMemberProfile(user: SupabaseAuthUser) {
  const metadata = user.user_metadata ?? {};
  const existing = await getMemberProfile(user.id).catch(() => null);
  if (existing) return existing;

  return saveMemberProfile({
    email: user.email || "",
    id: user.id,
    line_id: typeof metadata.line_id === "string" ? metadata.line_id : null,
    name: typeof metadata.name === "string" ? metadata.name : null,
    phone: typeof metadata.phone === "string" ? metadata.phone : null
  });
}

function isMissingProfilesTableError(error: unknown) {
  return error instanceof Error && error.message.includes("public.profiles");
}

async function supabaseAuthRequest<T>(
  path: string,
  options: {
    accessToken?: string;
    body?: unknown;
    method: "GET" | "POST" | "PUT";
  }
) {
  if (!supabaseUrl || !supabaseAuthKey) {
    throw new SupabaseAuthConfigError("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      apikey: supabaseAuthKey,
      Authorization: `Bearer ${options.accessToken ?? supabaseAuthKey}`,
      "Content-Type": "application/json"
    },
    method: options.method
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.msg || payload?.message || payload?.error_description || "Supabase Auth request failed";
    throw new Error(message);
  }

  return payload as T;
}
