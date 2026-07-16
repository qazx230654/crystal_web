import { NextResponse } from "next/server";
import { requireAdmin, requireAdminWrite } from "@/services/admin-auth";
import { validatePlanPayload, type AdminPlanPayload } from "@/services/experience/experience-validation";
import { listPlans, listPlansByExperience, createPlan } from "@/services/experience/plan.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const experienceId = new URL(request.url).searchParams.get("experienceId");
  const plans = experienceId ? await listPlansByExperience(experienceId) : await listPlans();

  return NextResponse.json({ data: plans });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as AdminPlanPayload;

    const validationError = validatePlanPayload(payload);
    if (validationError) return validationError;

    const plan = await createPlan({
      description: payload.description?.trim() || null,
      duration_minutes: payload.durationMinutes ?? null,
      experience_id: payload.experienceId!,
      is_active: payload.isActive ?? true,
      max_headcount: payload.maxHeadcount ?? null,
      min_headcount: payload.minHeadcount ?? 1,
      name: payload.name!.trim(),
      price_per_person: Number(payload.pricePerPerson),
      sort_order: payload.sortOrder ?? 0
    });

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增方案失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
