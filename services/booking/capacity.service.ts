import { experienceSessionRepository } from "@/repositories/experience-session-repository";

const MAX_CAS_ATTEMPTS = 3;

export async function reserveSessionCapacity(sessionId: string, headcount: number, attempt = 0): Promise<void> {
  const session = await experienceSessionRepository.getSessionCapacity(sessionId);
  if (!session) {
    throw new Error("找不到指定的場次");
  }

  const remaining = session.capacity - session.booked_count;
  if (remaining < headcount) {
    throw new Error(`此場次剩餘名額不足，僅剩 ${remaining} 位`);
  }

  const updated = await experienceSessionRepository.reserveSessionSeats(
    sessionId,
    session.booked_count,
    session.booked_count + headcount
  );

  if (updated.length) return;

  if (attempt >= MAX_CAS_ATTEMPTS) {
    throw new Error("場次名額更新失敗，請稍後再試");
  }

  return reserveSessionCapacity(sessionId, headcount, attempt + 1);
}

export async function releaseSessionCapacity(sessionId: string, headcount: number, attempt = 0): Promise<void> {
  const session = await experienceSessionRepository.getSessionCapacity(sessionId);
  if (!session) return;

  const nextBookedCount = Math.max(0, session.booked_count - headcount);
  const updated = await experienceSessionRepository.reserveSessionSeats(sessionId, session.booked_count, nextBookedCount);

  if (updated.length) return;

  if (attempt >= MAX_CAS_ATTEMPTS) {
    console.error(`[booking] Failed to release ${headcount} seat(s) for session ${sessionId}`);
    return;
  }

  return releaseSessionCapacity(sessionId, headcount, attempt + 1);
}
