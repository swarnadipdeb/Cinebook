package cinebook.movieService.controllers;

import cinebook.movieService.dto.request.ShowtimeCreateUpdateRequestDTO;
import cinebook.movieService.dto.response.ShowtimeResponseDTO;
import cinebook.movieService.services.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/catalog/v1/")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping("/movies/{movieId}/showtimes")
    public ResponseEntity<List<ShowtimeResponseDTO>> getShowtimesByMovie(
            @PathVariable String movieId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String startdate,
            @RequestParam(required = false) String enddate,
            @RequestParam(defaultValue = "false") boolean embed) {
        // startdate & enddate validation check
        if (startdate == null && enddate == null) {
            // Both null - valid
        } else if (startdate == null || enddate == null) {
            return ResponseEntity.badRequest().build();
        } else {
            LocalDate start = LocalDate.parse(startdate);
            LocalDate end = LocalDate.parse(enddate);

            if (start.isAfter(end)) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(showtimeService.getShowtimesByMovie(movieId, date, startdate, enddate,  embed));
    }

    @GetMapping("/theaters/{theaterId}/showtimes")
    public ResponseEntity<List<ShowtimeResponseDTO>> getShowtimesByTheater(
            @PathVariable String theaterId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "false") boolean embed) {
        return ResponseEntity.ok(showtimeService.getShowtimesByTheater(theaterId, date, embed));
    }

    @GetMapping("/showtimes/{id}")
    public ResponseEntity<ShowtimeResponseDTO> getShowtimeById(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean embed) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id, embed));
    }

    @PostMapping("/showtimes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowtimeResponseDTO> createShowtime(@Valid @RequestBody ShowtimeCreateUpdateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(showtimeService.createShowtime(request));
    }

    @PutMapping("/showtimes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowtimeResponseDTO> updateShowtime(
            @PathVariable String id, @Valid @RequestBody ShowtimeCreateUpdateRequestDTO request) {
        return ResponseEntity.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/showtimes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShowtime(@PathVariable String id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.noContent().build();
    }
}
