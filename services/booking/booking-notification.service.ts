import { notifyCustomerBookingCreated, notifyStoreOwnerNewBooking, runNotification } from "@/services/notification-service";

import type { BookingRecord } from "./types";

export async function notifyNewBooking(booking: BookingRecord) {
  await runNotification(() => notifyStoreOwnerNewBooking({ booking }));
  await runNotification(() => notifyCustomerBookingCreated({ booking }));
}
