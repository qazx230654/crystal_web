import { supabaseRest } from "@/services/supabase-rest";

export type ExperiencePlanRow = {
  id: string;
  experience_id: string;
  name: string;
  description: string | null;
  price_per_person: number;
  min_headcount: number;
  max_headcount: number | null;
  duration_minutes: number | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type ExperiencePlanInsertRecord = {
  experience_id: string;
  name: string;
  description?: string | null;
  price_per_person: number;
  min_headcount?: number;
  max_headcount?: number | null;
  duration_minutes?: number | null;
  is_active?: boolean;
  sort_order?: number;
};

export type ExperiencePlanUpdateRecord = Partial<ExperiencePlanInsertRecord>;

export class ExperiencePlanRepository {
  listPlans() {
    return supabaseRest<ExperiencePlanRow[]>("experience_plans", {
      query: "?select=*&order=sort_order.asc"
    });
  }

  listPlansByExperience(experienceId: string) {
    return supabaseRest<ExperiencePlanRow[]>("experience_plans", {
      query: `?experience_id=eq.${encodeURIComponent(experienceId)}&select=*&order=sort_order.asc`
    });
  }

  async getPlanById(id: string) {
    const [plan] = await supabaseRest<ExperiencePlanRow[]>("experience_plans", {
      query: `?id=eq.${encodeURIComponent(id)}&select=*`
    });

    return plan ?? null;
  }

  async createPlan(payload: ExperiencePlanInsertRecord) {
    const [plan] = await supabaseRest<ExperiencePlanRow[]>("experience_plans", {
      body: payload,
      method: "POST"
    });

    return plan;
  }

  async updatePlan(id: string, payload: ExperiencePlanUpdateRecord) {
    const [plan] = await supabaseRest<ExperiencePlanRow[]>("experience_plans", {
      body: payload,
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return plan;
  }
}

export const experiencePlanRepository = new ExperiencePlanRepository();
