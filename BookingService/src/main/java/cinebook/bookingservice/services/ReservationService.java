package cinebook.bookingservice.services;

import cinebook.bookingservice.dto.request.ReservationRequestDTO;
import cinebook.bookingservice.dto.response.ReservationResponseDTO;
import cinebook.bookingservice.exceptions.ReservationExpiredException;
import cinebook.bookingservice.exceptions.ResourceNotFoundException;
import cinebook.bookingservice.exceptions.SeatConflictException;
import cinebook.bookingservice.models.Reservation;
import cinebook.bookingservice.repositories.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);
    private final ReservationRepository reservationRepository;
    private final MongoTemplate mongoTemplate;

    @Value("${booking.reservation.expiry-minutes:10}")
    private long expiryMinutes;

    public ReservationService(ReservationRepository reservationRepository, MongoTemplate mongoTemplate) {
        this.reservationRepository = reservationRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public ReservationResponseDTO createReservation(ReservationRequestDTO dto, String userId) {
        Date now = new Date();

        deleteExistingActiveReservations(userId, dto.getShowtimeId(), now);

        Query conflictQuery = new Query(
                Criteria.where("showtimeId").is(dto.getShowtimeId())
                        .and("seats").in(dto.getSeats())
                        .and("expiresAt").gte(now)
        );
        List<Reservation> conflicts = mongoTemplate.find(conflictQuery, Reservation.class, "reservations");
        if (!conflicts.isEmpty()) {
            throw new SeatConflictException("Some seats are currently reserved by another user");
        }

        Reservation reservation = Reservation.builder()
                .showtimeId(dto.getShowtimeId())
                .screenId(dto.getScreenId())
                .seats(dto.getSeats())
                .userId(userId)
                .expiresAt(new Date(System.currentTimeMillis() + expiryMinutes * 60 * 1000))
                .build();

        reservation = reservationRepository.save(reservation);
        log.info("Reservation created: id={}, seats={}, showtimeId={}", reservation.getId(), dto.getSeats(), dto.getShowtimeId());
        return toResponse(reservation);
    }

    public void cancelReservation(String id, String userId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (!reservation.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Reservation not found");
        }

        if (reservation.getExpiresAt().before(new Date())) {
            throw new ReservationExpiredException("Reservation has expired");
        }

        reservationRepository.delete(reservation);
        log.info("Reservation cancelled: id={}, userId={}", id, userId);
    }

    public Reservation getReservation(String id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
    }

    private void deleteExistingActiveReservations(String userId, String showtimeId, Date now) {
        reservationRepository.deleteByUserIdAndShowtimeIdAndExpiresAtAfter(userId, showtimeId, now);
    }

    private ReservationResponseDTO toResponse(Reservation r) {
        return ReservationResponseDTO.builder()
                .id(r.getId())
                .showtimeId(r.getShowtimeId())
                .screenId(r.getScreenId())
                .seats(r.getSeats())
                .userId(r.getUserId())
                .expiresAt(r.getExpiresAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
