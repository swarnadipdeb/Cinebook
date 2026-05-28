package cinebook.movieService.services;

import cinebook.movieService.dto.event.ScreenLayoutEvent;
import cinebook.movieService.dto.request.ShowtimeCreateUpdateRequestDTO;
import cinebook.movieService.dto.request.ShowtimeSlotCreateUpdateRequestDTO;
import cinebook.movieService.dto.response.ShowtimeResponseDTO;
import cinebook.movieService.dto.response.TheaterDTO;
import cinebook.movieService.exceptions.DuplicateResourceException;
import cinebook.movieService.exceptions.ReferentialIntegrityException;
import cinebook.movieService.exceptions.ResourceNotFoundException;
import cinebook.movieService.kafka.ScreenLayoutDeletePublisher;
import cinebook.movieService.kafka.ScreenLayoutPublisher;
import cinebook.movieService.models.Showtime;
import cinebook.movieService.models.ShowtimeSlot;
import cinebook.movieService.models.Theater;
import cinebook.movieService.repositories.MovieRepository;
import cinebook.movieService.repositories.ShowtimeRepository;
import cinebook.movieService.repositories.TheaterRepository;
import cinebook.movieService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ScreenLayoutPublisher screenLayoutPublisher;
    private final ScreenLayoutDeletePublisher screenLayoutDeletePublisher;

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

    public ShowtimeResponseDTO createShowtime(ShowtimeCreateUpdateRequestDTO request) {
        ValidationUtils.validateSlots(mapCreateSlotsToEntitySlots(request.getSlots()));

        if (!movieRepository.existsById(request.getMovieId())) {
            throw new ReferentialIntegrityException(
                    "Movie with ID '" + request.getMovieId() + "' does not exist");
        }
        if (!theaterRepository.existsById(request.getTheaterId())) {
            throw new ReferentialIntegrityException(
                    "Theater with ID '" + request.getTheaterId() + "' does not exist");
        }

        if (showtimeRepository.existsByMovieIdAndTheaterIdAndFormat(
                request.getMovieId(), request.getTheaterId(), request.getFormat())) {
            throw new DuplicateResourceException(
                    "Showtime for movie '" + request.getMovieId()
                    + "' at theater '" + request.getTheaterId()
                    + "' in format '" + request.getFormat() + "' already exists");
        }

        List<ShowtimeSlot> slots = new ArrayList<>();
        List<ScreenLayoutEvent> events = new ArrayList<>();
        for(ShowtimeSlotCreateUpdateRequestDTO slot : request.getSlots()) {
            //generating screenId
            String screenId = UUID.randomUUID().toString();
            //coverting to ShowtimeSLot As per DB Schema
            slots.add(ShowtimeSlot.builder().screenId(screenId)
                    .date(slot.getDate())
                    .time(slot.getTime())
                    .build());
            //coverting to ScreenLayoutEvent For kafka publisher
            ScreenLayoutEvent.Pricing pricing = ScreenLayoutEvent.Pricing.builder()
                    .premiumPrice(slot.getPremiumPrice())
                    .regularPrice(slot.getRegularPrice())
                    .build();
            events.add(ScreenLayoutEvent.builder()
                    .movieId(request.getMovieId())
                    .screenId(screenId)
                    .theaterId(request.getTheaterId())
                    .rows(slot.getRows())
                    .cols(slot.getCols())
                    .premiumCols(slot.getPremiumCols())
                    .aisleAfterCol(slot.getAisleAfterCol())
                    .pricing(pricing)
                    .bookedSeats(List.of())
                    .build());
        }


        Showtime showtime = Showtime.builder()
                .movieId(request.getMovieId())
                .theaterId(request.getTheaterId())
                .slots(slots)
                .format(request.getFormat())
                .build();

        showtime = showtimeRepository.save(showtime);
        publishScreenLayoutEvents(events);
        return toResponseDTO(showtime, false);
    }

    public ShowtimeResponseDTO updateShowtime(String id, ShowtimeCreateUpdateRequestDTO request) {
        Showtime existing = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime with ID '" + id + "' not found"));

        ValidationUtils.validateSlots(mapCreateSlotsToEntitySlots(request.getSlots()));

        if (!movieRepository.existsById(request.getMovieId())) {
            throw new ReferentialIntegrityException(
                    "Movie with ID '" + request.getMovieId() + "' does not exist");
        }
        if (!theaterRepository.existsById(request.getTheaterId())) {
            throw new ReferentialIntegrityException(
                    "Theater with ID '" + request.getTheaterId() + "' does not exist");
        }

        List<ShowtimeSlot> slots = new ArrayList<>();
        List<ScreenLayoutEvent> events = new ArrayList<>();
        for (ShowtimeSlotCreateUpdateRequestDTO slot : request.getSlots()) {
            String screenId = UUID.randomUUID().toString();
            slots.add(ShowtimeSlot.builder()
                    .screenId(screenId)
                    .date(slot.getDate())
                    .time(slot.getTime())
                    .build());
            ScreenLayoutEvent.Pricing pricing = ScreenLayoutEvent.Pricing.builder()
                    .premiumPrice(slot.getPremiumPrice())
                    .regularPrice(slot.getRegularPrice())
                    .build();
            events.add(ScreenLayoutEvent.builder()
                    .movieId(request.getMovieId())
                    .screenId(screenId)
                    .theaterId(request.getTheaterId())
                    .rows(slot.getRows())
                    .cols(slot.getCols())
                    .premiumCols(slot.getPremiumCols())
                    .aisleAfterCol(slot.getAisleAfterCol())
                    .pricing(pricing)
                    .bookedSeats(List.of())
                    .build());
        }

        existing.setMovieId(request.getMovieId());
        existing.setTheaterId(request.getTheaterId());
        existing.setSlots(slots);
        existing.setFormat(request.getFormat());

        existing = showtimeRepository.save(existing);
        publishScreenLayoutEvents(events);
        return toResponseDTO(existing, false);
    }

    public void deleteShowtime(String id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime with ID '" + id + "' not found"));

        List<String> screenIds = showtime.getSlots().stream()
                .map(ShowtimeSlot::getScreenId)
                .toList();

        screenLayoutDeletePublisher.publish(screenIds);
        showtimeRepository.deleteById(showtime.getId());
    }

    private void publishScreenLayoutEvents(List<ScreenLayoutEvent> Events) {
        for (ScreenLayoutEvent Event : Events) {
            screenLayoutPublisher.publish(Event);
        }
    }

    public List<ShowtimeSlot> mapCreateSlotsToEntitySlots(List<ShowtimeSlotCreateUpdateRequestDTO> createSlots) {
        return createSlots.stream()
                .map(s -> ShowtimeSlot.builder()
                        .screenId(UUID.randomUUID().toString())
                        .time(s.getTime())
                        .date(s.getDate())
                        .build())
                .toList();
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
                .slots(showtime.getSlots())
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
                .slots(showtime.getSlots())
                .format(showtime.getFormat())
                .theater(theaterDTO)
                .createdAt(showtime.getCreatedAt())
                .updatedAt(showtime.getUpdatedAt())
                .build();
    }
}
