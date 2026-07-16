import { NextResponse } from "next/server";
import { listPlansByExperience } from "@/services/experience/plan.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const experienceId = new URL(request.url).searchParams.get("experienceId");
  if (!experienceId) {
    return NextResponse.json({ error: { message: "缺少 experienceId" } }, { status: 400 });
  }

  const plans = await listPlansByExperience(experienceId);

  return NextResponse.json({
    data: plans
      .filter((plan) => plan.is_active)
      .map((plan) => ({
        description: plan.description,
        durationMinutes: plan.duration_minutes,
        id: plan.id,
        maxHeadcount: plan.max_headcount,
        minHeadcount: plan.min_headcount,
        name: plan.name,
        pricePerPerson: plan.price_per_person
      }))
  });
}
