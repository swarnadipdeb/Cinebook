package cinebook.movieService.repositories;

import cinebook.movieService.models.Showtime;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends MongoRepository<Showtime, String> {

    List<Showtime> findByMovieId(String movieId);

    List<Showtime> findByMovieIdAndDate(String movieId, String date);

    List<Showtime> findByTheaterId(String theaterId);

    List<Showtime> findByTheaterIdAndDate(String theaterId, String date);

    List<Showtime> findByMovieIdAndTheaterIdAndDateAndScreen(
            String movieId, String theaterId, String date, String screen);

    List<Showtime> findByMovieIdIn(List<String> movieIds);

    List<Showtime> findByTheaterIdIn(List<String> theaterIds);

    boolean existsByMovieIdAndTheaterIdAndDateAndScreen(
            String movieId, String theaterId, String date, String screen);

    Optional<Showtime> findById(String id);
}
