export const ROUTES = {
  HOME: '/',
  MOVIE_DETAIL: '/movie/:id',
  SEAT_SELECTION: '/movie/:id/seats',
  CONFIRMATION: '/booking/:bookingId',
  BOOKING_CONFIRM: '/booking/confirm',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  OTP_VERIFY: '/auth/verify-otp',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const
