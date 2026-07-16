import { bookingRepository } from "@/repositories/booking-repository";

export function getBookingById(id: string) {
  return bookingRepository.getBookingById(id);
}

export function listBookings(limit = 100) {
  return bookingRepository.listBookings(limit);
}

export function listBookingsByUser(userId: string) {
  return bookingRepository.listBookingsByUser(userId);
}

export function listBookingsBySession(sessionId: string) {
  return bookingRepository.listBookingsBySession(sessionId);
}
