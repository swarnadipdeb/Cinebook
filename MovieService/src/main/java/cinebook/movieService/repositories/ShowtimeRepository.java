package cinebook.movieService.repositories;

import cinebook.movieService.models.Showtime;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends MongoRepository<Showtime, String> {

    List<Showtime> findByMovieId(String movieId);

    @Query("{'movieId': ?0, 'slots.date': ?1}")
    List<Showtime> findByMovieIdAndDate(String movieId, String date);

    List<Showtime> findByTheaterId(String theaterId);

    @Query("{'theaterId': ?0, 'slots.date': ?1}")
    List<Showtime> findByTheaterIdAndDate(String theaterId, String date);

    @Query("{'movieId': ?0, 'theaterId': ?1, 'slots.date': ?2, 'slots.screenId': ?3}")
    List<Showtime> findByMovieIdAndTheaterIdAndDateAndScreen(
            String movieId, String theaterId, String date, String screenId);

    boolean existsByMovieIdAndTheaterIdAndFormat(String movieId, String theaterId, String format);

    List<Showtime> findByMovieIdIn(List<String> movieIds);

    List<Showtime> findByTheaterIdIn(List<String> theaterIds);

    @Query("{'movieId': ?0, 'theaterId': ?1, 'slots.date': ?2, 'slots.screenId': ?3}")
    boolean existsByMovieIdAndTheaterIdAndDateAndScreen(
            String movieId, String theaterId, String date, String screenId);

    Optional<Showtime> findById(String id);
}
