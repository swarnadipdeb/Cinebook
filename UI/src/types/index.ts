// Domain types for the movie ticket booking system

export interface Movie {
  id: string
  title: string
  tagline: string
  poster: string
  backdrop: string
  rating: number
  duration: number
  genre: string[]
  language: string
  releaseDate: string
  director: string
  cast: string[]
  description: string
}

export interface MoviePageResponse {
  content: Movie[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface MovieQueryParams {
  page?: number
  size?: number
  genre?: string
  language?: string
  sort?: string
  sortDir?: 'asc' | 'desc'
}

export interface Theater {
  id: string
  name: string
  address: string
  screens: number
  amenities: string[]
}

export interface ShowtimeEntry {
  id: string
  movieId: string
  theaterId: string
  date: string
  times: string[]
  screen: string
  format: string
}

export interface Showtime extends ShowtimeEntry {
  theater: Theater
}

interface Role {
  name: string;
}

export interface UserRoles {
  roles: Role[];
}

// ---- Real API response types ----

export interface ShowSlot {
  screenId: string
  time: string
  date: string
  premiumPrice: number
  regularPrice: number
  rows: number
  cols: number
  premiumCols: number[]       // 1-based column indices
  aisleAfterCol: number       // 1-based column index
}

export interface ShowtimeResponseDTO {
  id: string
  movieId: string
  theaterId: string
  slots: ShowSlot[]
  format: string
  theater?: Theater
  createdAt?: string
  updatedAt?: string
}

export interface ScreenLayout {
  id: string
  movieId: string
  screenId: string
  theaterId: string
  rows: number
  cols: number
  premiumCols: number[]
  aisleAfterCol: number
  pricing: {
    premiumPrice: number
    regularPrice: number
  }
  bookedSeats: string[]
  createdAt: string
  updatedAt: string
}

export interface TheaterRequest {
  name: string
  address: string
  screens: number
  amenities: string[]
}

export interface ShowtimeSlotRequest {
  time: string
  date: string
  premiumPrice: number
  regularPrice: number
  rows: number
  cols: number
  premiumCols: number[]
  aisleAfterCol: number
}

export interface ShowtimeRequest {
  movieId: string
  theaterId: string
  format: string
  slots: ShowtimeSlotRequest[]
}

export type SeatType = 'available' | 'selected' | 'booked' | 'premium' | 'aisle' | 'disabled'

export interface Seat {
  row: string
  col: number
  type: SeatType
  price: number
  idx?: number // position in the grid row (unique key alongside row+col)
}

export type SeatResponseDTO = Seat

export interface BookingSeat {
  row: string
  col: number
  type: string
  price: number
}

export interface Reservation {
  id: string
  showtimeId: string
  screenId: string
  seats: string[]
  userId: string
  expiresAt: string
  createdAt: string
}

export interface BookingRequestDTO {
  reservationId: string
  showtimeId: string
  movieId: string
  theaterId: string
  screenId: string
  time: string
  seats: BookingSeat[]
  totalPrice: number
}

export interface BookingResponseDTO {
  id: string
  bookingId: string
  userId: string
  movieId: string
  showtimeId: string
  theaterId: string
  time: string
  screenId: string
  seats: BookingSeat[]
  totalPrice: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  movie: Movie
  showtime: ShowtimeResponseDTO
  slot: ShowSlot
  seats: Seat[]
  totalPrice: number
  status: string
  createdAt: string
  userId?: string
}

export interface BookingData {
  movie: Movie
  showtime: ShowtimeResponseDTO
  slot: ShowSlot
  seats: Seat[]
  totalPrice: number
}

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface UserInfo {
  username: string
  firstName: string
  lastName: string
  phoneNumber: number
  email: string
  profilePic: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface AuthContextValue {
  user: User | null
  isLoggedIn: boolean
  isAdmin: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; userName?: string; error?: string }>
  verifyOtp: (userName: string, otp: string, firstName?: string, lastName?: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export interface BookingContextValue {
  selectedMovie: Movie | null
  selectedShowtime: ShowtimeResponseDTO | null
  selectedSlot: ShowSlot | null
  selectedSeats: Seat[]
  totalPrice: number
  bookingId: string | null
  selectMovie: (movie: Movie) => void
  selectShowtime: (showtime: ShowtimeResponseDTO, slot: ShowSlot) => void
  toggleSeat: (seat: Seat) => void
  clearBooking: () => void
  confirmBooking: (id: string) => void
}
