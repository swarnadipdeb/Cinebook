package cinebook.movieService.services;

import cinebook.movieService.dto.request.TheaterRequestDTO;
import cinebook.movieService.dto.response.TheaterResponseDTO;
import cinebook.movieService.exceptions.ResourceNotFoundException;
import cinebook.movieService.models.Theater;
import cinebook.movieService.models.Showtime;
import cinebook.movieService.repositories.ShowtimeRepository;
import cinebook.movieService.repositories.TheaterRepository;
import cinebook.movieService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TheaterService {

    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;

    public List<TheaterResponseDTO> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public TheaterResponseDTO getTheaterById(String id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater with ID '" + id + "' not found"));
        return toResponseDTO(theater);
    }

    public TheaterResponseDTO createTheater(TheaterRequestDTO request) {
        ValidationUtils.validateScreens(request.getScreens());

        Theater theater = Theater.builder()
                .name(request.getName())
                .address(request.getAddress())
                .screens(request.getScreens())
                .amenities(request.getAmenities())
                .build();

        theater = theaterRepository.save(theater);
        return toResponseDTO(theater);
    }

    public TheaterResponseDTO updateTheater(String id, TheaterRequestDTO request) {
        Theater existing = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater with ID '" + id + "' not found"));

        ValidationUtils.validateScreens(request.getScreens());

        existing.setName(request.getName());
        existing.setAddress(request.getAddress());
        existing.setScreens(request.getScreens());
        existing.setAmenities(request.getAmenities());

        existing = theaterRepository.save(existing);
        return toResponseDTO(existing);
    }

    public void deleteTheater(String id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater with ID '" + id + "' not found"));

        List<Showtime> associatedShowtimes = showtimeRepository.findByTheaterId(id);
        if (!associatedShowtimes.isEmpty()) {
            showtimeRepository.deleteAll(associatedShowtimes);
        }
        theaterRepository.deleteById(id);
    }

    private TheaterResponseDTO toResponseDTO(Theater theater) {
        return TheaterResponseDTO.builder()
                .id(theater.getId())
                .name(theater.getName())
                .address(theater.getAddress())
                .screens(theater.getScreens())
                .amenities(theater.getAmenities())
                .createdAt(theater.getCreatedAt())
                .updatedAt(theater.getUpdatedAt())
                .build();
    }
}
