import { NextResponse } from "next/server";
import { requireAdmin, requireAdminWrite } from "@/services/admin-auth";
import { validatePlanPayload, type AdminPlanPayload } from "@/services/experience/experience-validation";
import { getPlanById, updatePlan } from "@/services/experience/plan.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const plan = await getPlanById(params.id);
  if (!plan) {
    return NextResponse.json({ error: { message: "找不到方案" } }, { status: 404 });
  }

  return NextResponse.json({ data: plan });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdminWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as AdminPlanPayload & { isActive?: boolean };

    if (Object.keys(payload).length === 1 && typeof payload.isActive === "boolean") {
      const plan = await updatePlan(params.id, { is_active: payload.isActive });
      return NextResponse.json({ data: plan });
    }

    const existing = await getPlanById(params.id);
    if (!existing) {
      return NextResponse.json({ error: { message: "找不到方案" } }, { status: 404 });
    }

    const merged: AdminPlanPayload = {
      description: payload.description ?? existing.description ?? undefined,
      durationMinutes: payload.durationMinutes ?? existing.duration_minutes ?? undefined,
      experienceId: payload.experienceId ?? existing.experience_id,
      maxHeadcount: payload.maxHeadcount ?? existing.max_headcount ?? undefined,
      minHeadcount: payload.minHeadcount ?? existing.min_headcount,
      name: payload.name ?? existing.name,
      pricePerPerson: payload.pricePerPerson ?? existing.price_per_person,
      sortOrder: payload.sortOrder ?? existing.sort_order
    };

    const validationError = validatePlanPayload(merged);
    if (validationError) return validationError;

    const plan = await updatePlan(params.id, {
      description: merged.description?.trim() || null,
      duration_minutes: merged.durationMinutes ?? null,
      max_headcount: merged.maxHeadcount ?? null,
      min_headcount: merged.minHeadcount ?? 1,
      name: merged.name!.trim(),
      price_per_person: Number(merged.pricePerPerson),
      sort_order: merged.sortOrder ?? 0
    });

    return NextResponse.json({ data: plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新方案失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
