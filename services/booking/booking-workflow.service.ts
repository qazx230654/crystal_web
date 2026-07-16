import { bookingRepository } from "@/repositories/booking-repository";
import { getBookingStatus, type AdminBookingAction } from "@/src/domain/booking";
import { getPaymentStatus } from "@/src/domain/payment";

import { releaseSessionCapacity } from "./capacity.service";
import type { BookingRecord } from "./types";

export async function updateBookingWorkflowAction(id: string, action: AdminBookingAction, message?: string) {
  const result = await bookingRepository.getBookingById(id);
  const currentBooking = result.booking as BookingRecord | null;

  if (!currentBooking) {
    throw new Error("Booking not found");
  }

  const currentStatus = getBookingStatus(currentBooking);
  const paymentStatus = getPaymentStatus(currentBooking);
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  let eventMessage = "";

  if (action === "confirm_booking") {
    if (currentStatus !== "pending" || paymentStatus !== "unpaid") {
      throw new Error("只有待確認且尚未付款的預約可以確認");
    }
    patch.booking_status = "confirmed";
    patch.payment_status = "paid";
    eventMessage = "已確認預約與付款";
  }

  if (action === "mark_attended") {
    if (currentStatus !== "confirmed") {
      throw new Error("只有已確認的預約可以標記到場");
    }
    patch.booking_status = "attended";
    eventMessage = "已標記到場";
  }

  if (action === "mark_no_show") {
    if (currentStatus !== "confirmed") {
      throw new Error("只有已確認的預約可以標記未到場");
    }
    patch.booking_status = "no_show";
    eventMessage = "已標記未到場";
  }

  if (action === "cancel_booking") {
    if (!message?.trim()) {
      throw new Error("取消預約需要填寫原因");
    }
    if (currentStatus !== "pending") {
      throw new Error("此預約狀態不可取消");
    }
    patch.booking_status = "cancelled";
    eventMessage = `預約已取消：${message.trim()}`;
  }

  if (action === "refund_booking") {
    if (paymentStatus !== "paid") {
      throw new Error("只有已付款的預約可以退款");
    }
    patch.payment_status = "refunding";
    patch.booking_status = "cancelled";
    eventMessage = message?.trim() ? `退款處理中：${message.trim()}` : "退款處理中";
  }

  if (!eventMessage) {
    throw new Error("不支援的預約操作");
  }

  const booking = await bookingRepository.updateBooking(id, patch);

  await bookingRepository.createBookingEvent({
    booking_id: id,
    message: eventMessage,
    metadata: {
      action,
      from: { booking_status: currentStatus, payment_status: paymentStatus },
      to: patch
    },
    type: "status_changed"
  });

  if (action === "cancel_booking" || action === "refund_booking") {
    await releaseSessionCapacity(currentBooking.session_id, currentBooking.headcount);
  }

  return booking;
}
