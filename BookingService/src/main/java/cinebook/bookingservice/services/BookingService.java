package cinebook.bookingservice.services;

import cinebook.bookingservice.dto.request.BookingRequestDTO;
import cinebook.bookingservice.dto.response.BookingResponseDTO;
import cinebook.bookingservice.dto.response.PaginatedResponse;
import cinebook.bookingservice.exceptions.ReservationExpiredException;
import cinebook.bookingservice.exceptions.ResourceNotFoundException;
import cinebook.bookingservice.models.Booking;
import cinebook.bookingservice.models.Reservation;
import cinebook.bookingservice.repositories.BookingRepository;
import cinebook.bookingservice.repositories.ReservationRepository;
import cinebook.bookingservice.utils.BookingIdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final ReservationRepository reservationRepository;
    private final ScreenLayoutService screenLayoutService;

    public BookingService(BookingRepository bookingRepository,
                          ReservationRepository reservationRepository,
                          ScreenLayoutService screenLayoutService) {
        this.bookingRepository = bookingRepository;
        this.reservationRepository = reservationRepository;
        this.screenLayoutService = screenLayoutService;
    }

    public BookingResponseDTO confirmBooking(BookingRequestDTO dto, String userId) {
        Reservation reservation = reservationRepository.findById(dto.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (reservation.getExpiresAt().before(new Date())) {
            throw new ReservationExpiredException("Reservation has expired");
        }

        if (!reservation.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Reservation not found");
        }

        List<String> seatLabels = dto.getSeats().stream()
                .map(seat -> seat.getRow() + seat.getCol())
                .collect(Collectors.toList());

        if (!seatLabels.isEmpty()) {
            screenLayoutService.bookSeats(dto.getMovieId(), dto.getScreenId(), seatLabels);
        }

        String bookingId = BookingIdGenerator.generate();

        Booking booking = Booking.builder()
                .bookingId(bookingId)
                .userId(userId)
                .movieId(dto.getMovieId())
                .showtimeId(dto.getShowtimeId())
                .theaterId(dto.getTheaterId())
                .time(dto.getTime())
                .screenId(dto.getScreenId())
                .seats(dto.getSeats())
                .totalPrice(dto.getTotalPrice())
                .status("confirmed")
                .build();

        booking = bookingRepository.save(booking);

        reservationRepository.delete(reservation);
        log.info("Booking confirmed: bookingId={}, userId={}, seats={}", bookingId, userId, seatLabels);

        return toResponse(booking);
    }

    public BookingResponseDTO getBookingByBookingId(String bookingId, String userId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with bookingId: " + bookingId));

        if (!booking.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        return toResponse(booking);
    }

    public PaginatedResponse<BookingResponseDTO> getUserBookings(String userId, int page, int size) {
        Page<Booking> bookingPage = bookingRepository.findAll(
                PageRequest.of(page, size,
                        Sort.by("createdAt").descending()));

        List<BookingResponseDTO> userBookings = bookingPage.getContent().stream()
                .filter(b -> b.getUserId().equals(userId))
                .map(this::toResponse)
                .collect(Collectors.toList());

        long totalElements = bookingRepository.findByUserId(userId).size();

        return PaginatedResponse.<BookingResponseDTO>builder()
                .content(userBookings)
                .totalElements(totalElements)
                .totalPages((int) Math.ceil((double) totalElements / size))
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private BookingResponseDTO toResponse(Booking b) {
        return BookingResponseDTO.builder()
                .id(b.getId())
                .bookingId(b.getBookingId())
                .userId(b.getUserId())
                .movieId(b.getMovieId())
                .showtimeId(b.getShowtimeId())
                .theaterId(b.getTheaterId())
                .time(b.getTime())
                .screenId(b.getScreenId())
                .seats(b.getSeats())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
