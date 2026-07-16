import {
  experienceSessionRepository,
  type ExperienceSessionInsertRecord,
  type ExperienceSessionUpdateRecord
} from "@/repositories/experience-session-repository";

export function listSessions(experienceId: string) {
  return experienceSessionRepository.listSessions(experienceId);
}

export function listOpenSessionsInRange(experienceId: string, fromDate: string, toDate: string) {
  return experienceSessionRepository.listOpenSessionsInRange(experienceId, fromDate, toDate);
}

export function getSessionById(id: string) {
  return experienceSessionRepository.getSessionById(id);
}

export function createSession(payload: ExperienceSessionInsertRecord) {
  return experienceSessionRepository.createSession(payload);
}

export function createSessionsBulk(payloads: ExperienceSessionInsertRecord[]) {
  return experienceSessionRepository.createSessions(payloads);
}

export function updateSession(id: string, payload: ExperienceSessionUpdateRecord) {
  return experienceSessionRepository.updateSession(id, payload);
}

export function closeSession(id: string) {
  return experienceSessionRepository.updateSession(id, { status: "closed" });
}
