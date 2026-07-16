import {
  experiencePlanRepository,
  type ExperiencePlanInsertRecord,
  type ExperiencePlanUpdateRecord
} from "@/repositories/experience-plan-repository";

export function listPlans() {
  return experiencePlanRepository.listPlans();
}

export function listPlansByExperience(experienceId: string) {
  return experiencePlanRepository.listPlansByExperience(experienceId);
}

export function getPlanById(id: string) {
  return experiencePlanRepository.getPlanById(id);
}

export function createPlan(payload: ExperiencePlanInsertRecord) {
  return experiencePlanRepository.createPlan(payload);
}

export function updatePlan(id: string, payload: ExperiencePlanUpdateRecord) {
  return experiencePlanRepository.updatePlan(id, payload);
}
