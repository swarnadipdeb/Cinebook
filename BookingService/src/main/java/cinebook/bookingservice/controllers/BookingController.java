package cinebook.bookingservice.controllers;

import cinebook.bookingservice.dto.request.BookingRequestDTO;
import cinebook.bookingservice.dto.response.BookingResponseDTO;
import cinebook.bookingservice.dto.response.PaginatedResponse;
import cinebook.bookingservice.security.UserRoleAuthenticationToken;
import cinebook.bookingservice.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> confirmBooking(
            @Valid @RequestBody BookingRequestDTO dto) {
        String userId = getUserIdFromContext();
        BookingResponseDTO response = bookingService.confirmBooking(dto, userId);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<BookingResponseDTO>> getUserBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = getUserIdFromContext();
        return ResponseEntity.ok(bookingService.getUserBookings(userId, page, size));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable String bookingId) {
        String userId = getUserIdFromContext();
        return ResponseEntity.ok(bookingService.getBookingByBookingId(bookingId, userId));
    }

    @GetMapping("/user/me")
    public ResponseEntity<PaginatedResponse<BookingResponseDTO>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = getUserIdFromContext();
        return ResponseEntity.ok(bookingService.getUserBookings(userId, page, size));
    }

    private String getUserIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserRoleAuthenticationToken token) {
            return (String) token.getPrincipal();
        }
        return null;
    }
}
