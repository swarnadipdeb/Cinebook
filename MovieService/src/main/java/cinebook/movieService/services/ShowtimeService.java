package cinebook.movieService.services;

import cinebook.movieService.dto.request.ShowtimeRequestDTO;
import cinebook.movieService.dto.response.ShowtimeResponseDTO;
import cinebook.movieService.dto.response.TheaterDTO;
import cinebook.movieService.exceptions.DuplicateResourceException;
import cinebook.movieService.exceptions.ReferentialIntegrityException;
import cinebook.movieService.exceptions.ResourceNotFoundException;
import cinebook.movieService.models.Showtime;
import cinebook.movieService.models.Theater;
import cinebook.movieService.repositories.MovieRepository;
import cinebook.movieService.repositories.ShowtimeRepository;
import cinebook.movieService.repositories.TheaterRepository;
import cinebook.movieService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    public List<ShowtimeResponseDTO> getShowtimesByMovie(String movieId, String date, boolean embedTheater) {
        List<Showtime> showtimes = (date != null && !date.isBlank())
                ? showtimeRepository.findByMovieIdAndDate(movieId, date)
                : showtimeRepository.findByMovieId(movieId);

        return toResponseDTOList(showtimes, embedTheater);
    }

    public List<ShowtimeResponseDTO> getShowtimesByTheater(String theaterId, String date, boolean embedTheater) {
        List<Showtime> showtimes = (date != null && !date.isBlank())
                ? showtimeRepository.findByTheaterIdAndDate(theaterId, date)
                : showtimeRepository.findByTheaterId(theaterId);

        return toResponseDTOList(showtimes, embedTheater);
    }

    public ShowtimeResponseDTO getShowtimeById(String id, boolean embedTheater) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime with ID '" + id + "' not found"));
        return toResponseDTO(showtime, embedTheater);
    }

    public ShowtimeResponseDTO createShowtime(ShowtimeRequestDTO request) {
        ValidationUtils.validateDate(request.getDate());
        ValidationUtils.validateTimes(request.getTimes());

        if (!movieRepository.existsById(request.getMovieId())) {
            throw new ReferentialIntegrityException(
                    "Movie with ID '" + request.getMovieId() + "' does not exist");
        }
        if (!theaterRepository.existsById(request.getTheaterId())) {
            throw new ReferentialIntegrityException(
                    "Theater with ID '" + request.getTheaterId() + "' does not exist");
        }

        if (showtimeRepository.existsByMovieIdAndTheaterIdAndDateAndScreen(
                request.getMovieId(), request.getTheaterId(), request.getDate(), request.getScreen())) {
            throw new DuplicateResourceException(
                    "Showtime already exists for this movie, theater, date, and screen combination");
        }

        Showtime showtime = Showtime.builder()
                .movieId(request.getMovieId())
                .theaterId(request.getTheaterId())
                .date(request.getDate())
                .times(request.getTimes())
                .screen(request.getScreen())
                .format(request.getFormat())
                .build();

        showtime = showtimeRepository.save(showtime);
        return toResponseDTO(showtime, false);
    }

    public ShowtimeResponseDTO updateShowtime(String id, ShowtimeRequestDTO request) {
        Showtime existing = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime with ID '" + id + "' not found"));

        ValidationUtils.validateDate(request.getDate());
        ValidationUtils.validateTimes(request.getTimes());

        if (!movieRepository.existsById(request.getMovieId())) {
            throw new ReferentialIntegrityException(
                    "Movie with ID '" + request.getMovieId() + "' does not exist");
        }
        if (!theaterRepository.existsById(request.getTheaterId())) {
            throw new ReferentialIntegrityException(
                    "Theater with ID '" + request.getTheaterId() + "' does not exist");
        }

        if (!existing.getMovieId().equals(request.getMovieId())
                || !existing.getTheaterId().equals(request.getTheaterId())
                || !existing.getDate().equals(request.getDate())
                || !existing.getScreen().equals(request.getScreen())) {
            if (showtimeRepository.existsByMovieIdAndTheaterIdAndDateAndScreen(
                    request.getMovieId(), request.getTheaterId(), request.getDate(), request.getScreen())) {
                throw new DuplicateResourceException(
                        "Showtime already exists for this movie, theater, date, and screen combination");
            }
        }

        existing.setMovieId(request.getMovieId());
        existing.setTheaterId(request.getTheaterId());
        existing.setDate(request.getDate());
        existing.setTimes(request.getTimes());
        existing.setScreen(request.getScreen());
        existing.setFormat(request.getFormat());

        existing = showtimeRepository.save(existing);
        return toResponseDTO(existing, false);
    }

    public void deleteShowtime(String id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime with ID '" + id + "' not found"));
        showtimeRepository.deleteById(id);
    }

    private List<ShowtimeResponseDTO> toResponseDTOList(List<Showtime> showtimes, boolean embedTheater) {
        if (!embedTheater || showtimes.isEmpty()) {
            return showtimes.stream()
                    .map(s -> toResponseDTO(s, false))
                    .toList();
        }

        List<String> theaterIds = showtimes.stream()
                .map(Showtime::getTheaterId)
                .distinct()
                .toList();

        List<Theater> theaters = theaterRepository.findByIdIn(theaterIds);
        Map<String, Theater> theaterMap = theaters.stream()
                .collect(Collectors.toMap(Theater::getId, t -> t));

        return showtimes.stream()
                .map(showtime -> toResponseDTOWithTheater(showtime, theaterMap))
                .toList();
    }

    private ShowtimeResponseDTO toResponseDTO(Showtime showtime, boolean embedTheater) {
        if (embedTheater) {
            Theater theater = theaterRepository.findById(showtime.getTheaterId()).orElse(null);
            return toResponseDTOWithTheater(showtime,
                    theater != null ? Map.of(showtime.getTheaterId(), theater) : Map.of());
        }

        return ShowtimeResponseDTO.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovieId())
                .theaterId(showtime.getTheaterId())
                .date(showtime.getDate())
                .times(showtime.getTimes())
                .screen(showtime.getScreen())
                .format(showtime.getFormat())
                .createdAt(showtime.getCreatedAt())
                .updatedAt(showtime.getUpdatedAt())
                .build();
    }

    private ShowtimeResponseDTO toResponseDTOWithTheater(Showtime showtime, Map<String, Theater> theaterMap) {
        Theater theater = theaterMap.get(showtime.getTheaterId());

        TheaterDTO theaterDTO = null;
        if (theater != null) {
            theaterDTO = TheaterDTO.builder()
                    .id(theater.getId())
                    .name(theater.getName())
                    .address(theater.getAddress())
                    .screens(theater.getScreens())
                    .amenities(theater.getAmenities())
                    .build();
        }

        return ShowtimeResponseDTO.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovieId())
                .theaterId(showtime.getTheaterId())
                .date(showtime.getDate())
                .times(showtime.getTimes())
                .screen(showtime.getScreen())
                .format(showtime.getFormat())
                .theater(theaterDTO)
                .createdAt(showtime.getCreatedAt())
                .updatedAt(showtime.getUpdatedAt())
                .build();
    }
}
