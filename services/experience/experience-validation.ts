import { NextResponse } from "next/server";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";

const validExperienceIds = new Set(workshopExperiences.map((experience) => experience.id));

export type AdminPlanPayload = {
  experienceId?: string;
  name?: string;
  description?: string;
  pricePerPerson?: number;
  minHeadcount?: number;
  maxHeadcount?: number | null;
  durationMinutes?: number | null;
  isActive?: boolean;
  sortOrder?: number;
};

export function validatePlanPayload(payload: AdminPlanPayload) {
  if (!payload.experienceId || !validExperienceIds.has(payload.experienceId)) {
    return NextResponse.json({ error: { message: "請選擇有效的體驗項目" } }, { status: 400 });
  }
  if (!payload.name?.trim()) {
    return NextResponse.json({ error: { message: "請輸入方案名稱" } }, { status: 400 });
  }
  if (!payload.pricePerPerson || Number(payload.pricePerPerson) <= 0) {
    return NextResponse.json({ error: { message: "請輸入正確的每人價格" } }, { status: 400 });
  }
  const minHeadcount = payload.minHeadcount ?? 1;
  if (!Number.isInteger(minHeadcount) || minHeadcount < 1) {
    return NextResponse.json({ error: { message: "最少人數需為 1 以上的整數" } }, { status: 400 });
  }
  if (payload.maxHeadcount !== undefined && payload.maxHeadcount !== null) {
    if (!Number.isInteger(payload.maxHeadcount) || payload.maxHeadcount < minHeadcount) {
      return NextResponse.json({ error: { message: "最多人數不可小於最少人數" } }, { status: 400 });
    }
  }

  return null;
}

export type AdminSessionPayload = {
  experienceId?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string | null;
  capacity?: number;
};

export function validateSessionPayload(payload: AdminSessionPayload) {
  if (!payload.experienceId || !validExperienceIds.has(payload.experienceId)) {
    return NextResponse.json({ error: { message: "請選擇有效的體驗項目" } }, { status: 400 });
  }
  if (!payload.sessionDate?.trim()) {
    return NextResponse.json({ error: { message: "請選擇場次日期" } }, { status: 400 });
  }
  if (!payload.startTime?.trim()) {
    return NextResponse.json({ error: { message: "請選擇場次開始時間" } }, { status: 400 });
  }
  if (!payload.capacity || !Number.isInteger(payload.capacity) || payload.capacity <= 0) {
    return NextResponse.json({ error: { message: "請輸入正確的名額上限" } }, { status: 400 });
  }

  return null;
}
