package cinebook.movieService.controllers;

import cinebook.movieService.dto.request.ShowtimeRequestDTO;
import cinebook.movieService.dto.response.ShowtimeResponseDTO;
import cinebook.movieService.services.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping("/api/movies/{movieId}/showtimes")
    public ResponseEntity<List<ShowtimeResponseDTO>> getShowtimesByMovie(
            @PathVariable String movieId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "false") boolean embed) {
        return ResponseEntity.ok(showtimeService.getShowtimesByMovie(movieId, date, embed));
    }

    @GetMapping("/api/theaters/{theaterId}/showtimes")
    public ResponseEntity<List<ShowtimeResponseDTO>> getShowtimesByTheater(
            @PathVariable String theaterId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "false") boolean embed) {
        return ResponseEntity.ok(showtimeService.getShowtimesByTheater(theaterId, date, embed));
    }

    @GetMapping("/api/showtimes/{id}")
    public ResponseEntity<ShowtimeResponseDTO> getShowtimeById(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean embed) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id, embed));
    }

    @PostMapping("/api/showtimes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowtimeResponseDTO> createShowtime(@Valid @RequestBody ShowtimeRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(showtimeService.createShowtime(request));
    }

    @PutMapping("/api/showtimes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowtimeResponseDTO> updateShowtime(
            @PathVariable String id, @Valid @RequestBody ShowtimeRequestDTO request) {
        return ResponseEntity.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/api/showtimes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShowtime(@PathVariable String id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.noContent().build();
    }
}
