import { getPaymentStatus } from "@/src/domain/payment";
import { getBookingStatus } from "@/src/domain/booking/status";

export type AdminBookingAction = "confirm_booking" | "mark_attended" | "mark_no_show" | "cancel_booking" | "refund_booking";

export type AdminBookingActionTone = "danger" | "primary";

export type AdminBookingActionOption = {
  id: AdminBookingAction;
  label: string;
  tone?: AdminBookingActionTone;
};

export type AdminBookingActionSource = {
  booking_status?: string | null;
  payment_status?: string | null;
};

export const adminBookingActionLabels: Record<AdminBookingAction, string> = {
  confirm_booking: "確認預約",
  mark_attended: "標記已到場",
  mark_no_show: "標記未到場",
  cancel_booking: "取消預約",
  refund_booking: "取消並退款"
};

export function getAvailableAdminBookingActions(booking: AdminBookingActionSource): AdminBookingActionOption[] {
  const bookingStatus = getBookingStatus(booking);
  const paymentStatus = getPaymentStatus(booking);
  const actions: AdminBookingActionOption[] = [];

  if (bookingStatus === "pending" && paymentStatus === "unpaid") {
    actions.push({ id: "confirm_booking", label: adminBookingActionLabels.confirm_booking, tone: "primary" });
    actions.push({ id: "cancel_booking", label: adminBookingActionLabels.cancel_booking, tone: "danger" });
  }

  if (bookingStatus === "confirmed" && paymentStatus === "paid") {
    actions.push({ id: "mark_attended", label: adminBookingActionLabels.mark_attended, tone: "primary" });
    actions.push({ id: "mark_no_show", label: adminBookingActionLabels.mark_no_show });
    actions.push({ id: "refund_booking", label: adminBookingActionLabels.refund_booking, tone: "danger" });
  }

  if ((bookingStatus === "attended" || bookingStatus === "no_show") && paymentStatus === "paid") {
    actions.push({ id: "refund_booking", label: adminBookingActionLabels.refund_booking, tone: "danger" });
  }

  return actions;
}
