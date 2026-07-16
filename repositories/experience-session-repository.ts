import { supabaseRest } from "@/services/supabase-rest";

export type ExperienceSessionRow = {
  id: string;
  experience_id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  booked_count: number;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type ExperienceSessionInsertRecord = {
  experience_id: string;
  session_date: string;
  start_time: string;
  end_time?: string | null;
  capacity: number;
  status?: string;
};

export type ExperienceSessionUpdateRecord = Partial<
  Pick<ExperienceSessionInsertRecord, "session_date" | "start_time" | "end_time" | "capacity" | "status">
>;

export class ExperienceSessionRepository {
  listSessions(experienceId: string) {
    return supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      query: `?experience_id=eq.${encodeURIComponent(experienceId)}&select=*&order=session_date.asc,start_time.asc`
    });
  }

  listOpenSessionsInRange(experienceId: string, fromDate: string, toDate: string) {
    return supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      query:
        `?experience_id=eq.${encodeURIComponent(experienceId)}` +
        `&session_date=gte.${encodeURIComponent(fromDate)}` +
        `&session_date=lte.${encodeURIComponent(toDate)}` +
        `&status=eq.open&select=*&order=session_date.asc,start_time.asc`
    });
  }

  async getSessionById(id: string) {
    const [session] = await supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      query: `?id=eq.${encodeURIComponent(id)}&select=*`
    });

    return session ?? null;
  }

  async getSessionCapacity(id: string) {
    const [session] = await supabaseRest<Array<Pick<ExperienceSessionRow, "id" | "capacity" | "booked_count">>>(
      "experience_sessions",
      {
        query: `?id=eq.${encodeURIComponent(id)}&select=id,capacity,booked_count`
      }
    );

    return session ?? null;
  }

  reserveSessionSeats(id: string, expectedBookedCount: number, nextBookedCount: number) {
    return supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      body: { booked_count: nextBookedCount },
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}&booked_count=eq.${expectedBookedCount}`
    });
  }

  async createSession(payload: ExperienceSessionInsertRecord) {
    const [session] = await supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      body: payload,
      method: "POST"
    });

    return session;
  }

  async createSessions(payloads: ExperienceSessionInsertRecord[]) {
    return supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      body: payloads,
      method: "POST"
    });
  }

  async updateSession(id: string, payload: ExperienceSessionUpdateRecord) {
    const [session] = await supabaseRest<ExperienceSessionRow[]>("experience_sessions", {
      body: payload,
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return session;
  }
}

export const experienceSessionRepository = new ExperienceSessionRepository();
