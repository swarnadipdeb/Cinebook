package cinebook.bookingservice.controllers;

import cinebook.bookingservice.dto.request.BookedSeatsUpdateDTO;
import cinebook.bookingservice.exceptions.ResourceNotFoundException;
import cinebook.bookingservice.dto.request.ScreenLayoutRequestDTO;
import cinebook.bookingservice.dto.response.SeatResponseDTO;
import cinebook.bookingservice.models.ScreenLayout;
import cinebook.bookingservice.services.ScreenLayoutService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class ScreenLayoutController {

    private final ScreenLayoutService screenLayoutService;

    public ScreenLayoutController(ScreenLayoutService screenLayoutService) {
        this.screenLayoutService = screenLayoutService;
    }

    @GetMapping("/movies/{movieId}/screens/{screenId}/seats")
    public ResponseEntity<List<List<SeatResponseDTO>>> getSeatMap(
            @PathVariable String movieId,
            @PathVariable String screenId) {
        return ResponseEntity.ok(screenLayoutService.getSeatMap(movieId, screenId));
    }

    @PostMapping("/screens")
    public ResponseEntity<ScreenLayout> createScreenLayout(
            @Valid @RequestBody ScreenLayoutRequestDTO dto) {
        ScreenLayout layout = screenLayoutService.createLayout(dto);
        return ResponseEntity.status(201).body(layout);
    }

    @PutMapping("/screens/{id}")
    public ResponseEntity<ScreenLayout> updateScreenLayout(
            @PathVariable String id,
            @Valid @RequestBody ScreenLayoutRequestDTO dto) {
        return ResponseEntity.ok(screenLayoutService.updateLayout(id, dto));
    }

    @PatchMapping("/screens/{id}/booked-seats")
    public ResponseEntity<ScreenLayout> updateBookedSeats(
            @PathVariable String id,
            @Valid @RequestBody BookedSeatsUpdateDTO dto) {
        return ResponseEntity.ok(screenLayoutService.updateBookedSeats(id, dto));
    }

    @DeleteMapping("/screens/{id}")
    public ResponseEntity<Void> deleteScreenLayout(@PathVariable String id) {
        screenLayoutService.deleteLayout(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/screens/batch")
    public ResponseEntity<Void> deleteScreenLayouts(@RequestBody List<String> ids) {
        screenLayoutService.deleteLayouts(ids);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/movies/{movieId}/screens/{screenId}/slots")
    public ResponseEntity<ScreenLayout> getAllSlots(
            @PathVariable String movieId,
            @PathVariable String screenId) {
        return ResponseEntity.ok(screenLayoutService.findByMovieIdAndScreenId(movieId, screenId));
    }
}