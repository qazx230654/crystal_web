import { supabaseRest } from "@/services/supabase-rest";

export type MemberProfileRecord = {
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

export class MemberRepository {
  async getProfile(id: string) {
    const rows = await supabaseRest<MemberProfileRecord[]>("profiles", {
      query: `?id=eq.${encodeURIComponent(id)}&select=*`
    });

    return rows[0] ?? null;
  }

  async updateProfile(id: string, payload: Record<string, unknown>) {
    const [updated] = await supabaseRest<MemberProfileRecord[]>("profiles", {
      body: payload,
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return updated;
  }

  async createProfile(payload: Record<string, unknown>) {
    const [created] = await supabaseRest<MemberProfileRecord[]>("profiles", {
      body: payload,
      method: "POST"
    });

    return created;
  }
}

export const memberRepository = new MemberRepository();
