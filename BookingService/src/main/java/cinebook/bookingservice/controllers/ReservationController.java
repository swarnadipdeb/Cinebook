package cinebook.bookingservice.controllers;

import cinebook.bookingservice.dto.request.ReservationRequestDTO;
import cinebook.bookingservice.dto.response.ReservationResponseDTO;
import cinebook.bookingservice.security.UserRoleAuthenticationToken;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings/reservations")
public class ReservationController {

    private final cinebook.bookingservice.services.ReservationService reservationService;

    public ReservationController(cinebook.bookingservice.services.ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> createReservation(
            @Valid @RequestBody ReservationRequestDTO dto) {
        String userId = getUserIdFromContext();
        ReservationResponseDTO response = reservationService.createReservation(dto, userId);
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable String id) {
        String userId = getUserIdFromContext();
        reservationService.cancelReservation(id, userId);
        return ResponseEntity.noContent().build();
    }

    private String getUserIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserRoleAuthenticationToken token) {
            return (String) token.getPrincipal();
        }
        return null;
    }
}
