package cinebook.movieService.controllers;

import cinebook.movieService.dto.request.TheaterRequestDTO;
import cinebook.movieService.dto.response.TheaterResponseDTO;
import cinebook.movieService.services.TheaterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    private final TheaterService theaterService;

    public TheaterController(TheaterService theaterService) {
        this.theaterService = theaterService;
    }

    @GetMapping
    public ResponseEntity<List<TheaterResponseDTO>> getAllTheaters() {
        return ResponseEntity.ok(theaterService.getAllTheaters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheaterResponseDTO> getTheaterById(@PathVariable String id) {
        return ResponseEntity.ok(theaterService.getTheaterById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheaterResponseDTO> createTheater(@Valid @RequestBody TheaterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(theaterService.createTheater(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheaterResponseDTO> updateTheater(
            @PathVariable String id, @Valid @RequestBody TheaterRequestDTO request) {
        return ResponseEntity.ok(theaterService.updateTheater(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTheater(@PathVariable String id) {
        theaterService.deleteTheater(id);
        return ResponseEntity.noContent().build();
    }
}
