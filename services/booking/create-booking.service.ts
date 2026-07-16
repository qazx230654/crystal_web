import { bookingRepository } from "@/repositories/booking-repository";
import { experiencePlanRepository } from "@/repositories/experience-plan-repository";

import { notifyNewBooking } from "./booking-notification.service";
import { releaseSessionCapacity, reserveSessionCapacity } from "./capacity.service";
import type { CreateBookingInput } from "./types";

export function createBookingNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK${yyyymmdd}${suffix}`;
}

export function validateBookingInput(input: CreateBookingInput) {
  if (!input.customer?.name?.trim()) throw new Error("customer.name is required");
  if (!input.customer?.phone?.trim()) throw new Error("customer.phone is required");
  if (!input.experienceId) throw new Error("experienceId is required");
  if (!input.planId) throw new Error("planId is required");
  if (!input.sessionId) throw new Error("sessionId is required");
  if (!input.headcount || input.headcount < 1) throw new Error("headcount is required");
  if (!input.paymentMethod) throw new Error("paymentMethod is required");
}

export async function createBooking(input: CreateBookingInput) {
  validateBookingInput(input);

  const plan = await experiencePlanRepository.getPlanById(input.planId);
  if (!plan || !plan.is_active || plan.experience_id !== input.experienceId) {
    throw new Error("找不到指定的方案");
  }
  if (input.headcount < plan.min_headcount || (plan.max_headcount !== null && input.headcount > plan.max_headcount)) {
    throw new Error(`人數需介於 ${plan.min_headcount} 到 ${plan.max_headcount ?? "不限"} 人之間`);
  }

  const bookingNumber = createBookingNumber();
  const unitPrice = plan.price_per_person;
  const total = unitPrice * input.headcount;

  await reserveSessionCapacity(input.sessionId, input.headcount);

  let booking;
  try {
    booking = await bookingRepository.createBooking({
      booking_status: "pending",
      customer_email: input.customer.email || null,
      customer_name: input.customer.name,
      customer_phone: input.customer.phone,
      experience_id: input.experienceId,
      headcount: input.headcount,
      line_id: input.customer.lineId || null,
      note: input.note || null,
      payment_method: input.paymentMethod,
      payment_status: "unpaid",
      plan_id: input.planId,
      session_id: input.sessionId,
      total,
      unit_price: unitPrice,
      ...(input.userId ? { user_id: input.userId } : {}),
      booking_number: bookingNumber
    });
  } catch (error) {
    await releaseSessionCapacity(input.sessionId, input.headcount);
    throw error;
  }

  await bookingRepository.createBookingEvent({
    booking_id: booking.id,
    message: "預約已建立",
    metadata: { bookingNumber },
    type: "created"
  });

  await notifyNewBooking(booking);

  return { booking };
}
