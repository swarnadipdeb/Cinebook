package cinebook.bookingservice.services;

import cinebook.bookingservice.dto.request.BookedSeatsUpdateDTO;
import cinebook.bookingservice.dto.request.ScreenLayoutRequestDTO;
import cinebook.bookingservice.dto.response.SeatResponseDTO;
import cinebook.bookingservice.exceptions.DuplicateResourceException;
import cinebook.bookingservice.exceptions.ResourceNotFoundException;
import cinebook.bookingservice.exceptions.SeatsNotAvailableException;
import cinebook.bookingservice.models.ScreenLayout;
import cinebook.bookingservice.repositories.ScreenLayoutRepository;
import cinebook.bookingservice.utils.SeatLabelGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScreenLayoutService {

    private static final Logger log = LoggerFactory.getLogger(ScreenLayoutService.class);
    private final ScreenLayoutRepository screenLayoutRepository;

    public ScreenLayoutService(ScreenLayoutRepository screenLayoutRepository) {
        this.screenLayoutRepository = screenLayoutRepository;
    }

    public ScreenLayout createLayout(ScreenLayoutRequestDTO dto) {
        ScreenLayout existing = screenLayoutRepository
                .findByMovieIdAndScreenIdAndTheaterId(dto.getMovieId(), dto.getScreenId(), dto.getTheaterId());
        if (existing != null) {
            throw new DuplicateResourceException(
                    "Screen layout already exists for movieId=" + dto.getMovieId() +
                            ", screenId=" + dto.getScreenId() + ", theaterId=" + dto.getTheaterId());
        }

        validateLayoutRequest(dto);

        ScreenLayout layout = ScreenLayout.builder()
                .movieId(dto.getMovieId())
                .screenId(dto.getScreenId())
                .theaterId(dto.getTheaterId())
                .rows(dto.getRows())
                .cols(dto.getCols())
                .premiumCols(dto.getPremiumCols())
                .aisleAfterCol(dto.getAisleAfterCol())
                .pricing(ScreenLayout.Pricing.builder()
                        .premium(dto.getPricing().getPremium())
                        .regular(dto.getPricing().getRegular())
                        .build())
                .bookedSeats(dto.getBookedSeats() != null ? dto.getBookedSeats() : new ArrayList<>())
                .build();

        return screenLayoutRepository.save(layout);
    }

    public ScreenLayout updateLayout(String id, ScreenLayoutRequestDTO dto) {
        ScreenLayout existing = findById(id);
        validateLayoutRequest(dto);

        existing.setRows(dto.getRows());
        existing.setCols(dto.getCols());
        existing.setPremiumCols(dto.getPremiumCols());
        existing.setAisleAfterCol(dto.getAisleAfterCol());
        existing.setPricing(ScreenLayout.Pricing.builder()
                .premium(dto.getPricing().getPremium())
                .regular(dto.getPricing().getRegular())
                .build());

        return screenLayoutRepository.save(existing);
    }

    public ScreenLayout bookSeats(String movieId, String screenId, List<String> seatLabels) {
        ScreenLayout layout = screenLayoutRepository.findByMovieIdAndScreenId(movieId, screenId);
        if (layout == null) {
            throw new ResourceNotFoundException("Screen layout not found for movieId=" + movieId + ", screenId=" + screenId);
        }

        for (String seat : seatLabels) {
            if (layout.getBookedSeats().contains(seat)) {
                throw new SeatsNotAvailableException("One or more seats are no longer available");
            }
        }

        layout.getBookedSeats().addAll(seatLabels);
        return screenLayoutRepository.save(layout);
    }

    public ScreenLayout updateBookedSeats(String id, BookedSeatsUpdateDTO dto) {
        ScreenLayout layout = findById(id);
        List<String> seats = layout.getBookedSeats();

        switch (dto.getOperation().toLowerCase()) {
            case "add":
                for (String seat : dto.getSeats()) {
                    if (!seats.contains(seat)) {
                        seats.add(seat);
                    }
                }
                break;
            case "remove":
                seats.removeAll(dto.getSeats());
                break;
            case "set":
                layout.setBookedSeats(new ArrayList<>(dto.getSeats()));
                return screenLayoutRepository.save(layout);
            default:
                throw new IllegalArgumentException("Unknown operation: " + dto.getOperation());
        }

        return screenLayoutRepository.save(layout);
    }

    public void deleteLayout(String id) {
        if (!screenLayoutRepository.existsById(id)) {
            throw new ResourceNotFoundException("Screen layout not found with id: " + id);
        }
        screenLayoutRepository.deleteById(id);
    }

    public void deleteLayouts(List<String> ids) {
        screenLayoutRepository.deleteByIdIn(ids);
    }

    public void deleteLayoutsByScreenIds(List<String> screenIds) {
        screenLayoutRepository.deleteByScreenIdIn(screenIds);
    }

    public ScreenLayout findById(String id) {
        return screenLayoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen layout not found with id: " + id));
    }

    public List<ScreenLayout> findByMovieIdAndTheaterId(String movieId, String theaterId) {
        return screenLayoutRepository.findByMovieIdAndTheaterId(movieId, theaterId);
    }

    public ScreenLayout findByMovieIdAndScreenId(String movieId, String screenId) {
        ScreenLayout layout = screenLayoutRepository.findByMovieIdAndScreenId(movieId, screenId);
        if (layout == null) {
            throw new ResourceNotFoundException("Screen layout not found for movieId=" + movieId + ", screenId=" + screenId);
        }
        return layout;
    }

    public List<ScreenLayout> findByMovieIdAndScreenIds(String movieId, List<String> screenIds) {
        return screenLayoutRepository.findByMovieIdAndScreenIdIn(movieId, screenIds);
    }

    public List<List<SeatResponseDTO>> getSeatMap(String movieId, String screenId) {
        ScreenLayout layout = screenLayoutRepository.findByMovieIdAndScreenId(movieId, screenId);
        if (layout == null) {
            throw new ResourceNotFoundException("Screen layout not found for movieId=" + movieId + ", screenId=" + screenId);
        }

        List<List<SeatResponseDTO>> seatMap = new ArrayList<>();
        List<String> booked = layout.getBookedSeats();

        for (int r = 0; r < layout.getRows(); r++) {
            List<SeatResponseDTO> row = new ArrayList<>();
            char rowChar = (char) ('A' + r);

            for (int c = 0; c < layout.getCols(); c++) {
                String label = SeatLabelGenerator.generate(r, c);
                boolean isBooked = booked.contains(label);
                boolean isPremium = layout.getPremiumCols().contains(c);

                SeatResponseDTO seat = SeatResponseDTO.builder()
                        .row(String.valueOf(rowChar))
                        .col(c + 1)
                        .type(isBooked ? "booked" : (isPremium ? "premium" : "available"))
                        .price(isBooked ? 0 : (isPremium ? layout.getPricing().getPremium() : layout.getPricing().getRegular()))
                        .build();
                row.add(seat);

                if (layout.getAisleAfterCol() != null
                        && layout.getAisleAfterCol() > 0
                        && layout.getAisleAfterCol() < layout.getCols()
                        && c == layout.getAisleAfterCol() - 1) {
                    SeatResponseDTO aisle = SeatResponseDTO.builder()
                            .row(String.valueOf(rowChar))
                            .col(c + 1)
                            .type("aisle")
                            .price(0.0)
                            .build();
                    row.add(aisle);
                }
            }
            seatMap.add(row);
        }

        return seatMap;
    }

    private void validateLayoutRequest(ScreenLayoutRequestDTO dto) {
        if (dto.getPremiumCols() != null) {
            dto.getPremiumCols().removeIf(col -> col < 0 || col >= dto.getCols());
        }
        if (dto.getAisleAfterCol() != null && (dto.getAisleAfterCol() < 1 || dto.getAisleAfterCol() >= dto.getCols())) {
            dto.setAisleAfterCol(null);
        }
        if (dto.getPricing().getPremium() <= 0) {
            throw new IllegalArgumentException("premium price must be > 0");
        }
        if (dto.getPricing().getRegular() <= 0) {
            throw new IllegalArgumentException("regular price must be > 0");
        }
    }
}
