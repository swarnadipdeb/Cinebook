package cinebook.bookingservice.repositories;

import cinebook.bookingservice.models.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    Optional<Booking> findByBookingId(String bookingId);

    List<Booking> findByUserId(String userId);

    void deleteByBookingId(String bookingId);

}
