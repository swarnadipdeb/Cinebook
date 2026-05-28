package cinebook.bookingservice.repositories;

import cinebook.bookingservice.models.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {

    List<Reservation> findByShowtimeIdAndSeatsInAndExpiresAtAfter(String showtimeId, List<String> seats, Date now);

    List<Reservation> findByUserIdAndShowtimeIdAndExpiresAtAfter(String userId, String showtimeId, Date now);

    void deleteByUserIdAndShowtimeIdAndExpiresAtAfter(String userId, String showtimeId, Date now);
}
