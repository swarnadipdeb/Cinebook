package cinebook.movieService.repositories;

import cinebook.movieService.models.Showtime;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends MongoRepository<Showtime, String> {

    List<Showtime> findByMovieId(String movieId);

    @Query("{'movieId': ?0, 'slots.date': ?1}")
    List<Showtime> findByMovieIdAndDate(String movieId, LocalDate date);

    List<Showtime> findByTheaterId(String theaterId);

    @Query("{'theaterId': ?0, 'slots.date': ?1}")
    List<Showtime> findByTheaterIdAndDate(String theaterId, LocalDate date);

    @Query("{'movieId': ?0, 'theaterId': ?1, 'slots.date': ?2, 'slots.screenId': ?3}")
    List<Showtime> findByMovieIdAndTheaterIdAndDateAndScreen(
            String movieId, String theaterId, LocalDate date, String screenId);

    boolean existsByMovieIdAndTheaterIdAndFormat(String movieId, String theaterId, String format);

    List<Showtime> findByMovieIdIn(List<String> movieIds);

    List<Showtime> findByTheaterIdIn(List<String> theaterIds);

    @Query("{'movieId': ?0, 'theaterId': ?1, 'slots.date': ?2, 'slots.screenId': ?3}")
    boolean existsByMovieIdAndTheaterIdAndDateAndScreen(
            String movieId, String theaterId, String date, String screenId);

    Optional<Showtime> findById(String id);

    @Aggregation(pipeline = {
            "{ '$match': { " +
                    "'movieId': ?0, " +
                    "'slots.date': { '$gte': ?1, '$lt': ?2 } " +
                    "} }",

            "{ '$project': { " +
                    "'_id': 1, " +
                    "'movieId': 1, " +
                    "'theaterId': 1, " +
                    "'format': 1, " +
                    "'createdAt': 1, " +
                    "'updatedAt': 1, " +
                    "'slots': { " +
                    "'$filter': { " +
                    "'input': '$slots', " +
                    "'as': 'slot', " +
                    "'cond': { " +
                    "'$and': [ " +
                    "{ '$gte': [ '$$slot.date', ?1 ] }, " +
                    "{ '$lt': [ '$$slot.date', ?2 ] } " +
                    "] " +
                    "} " +
                    "} " +
                    "} " +
                    "} }"
    })
    List<Showtime> findByMovieIdAndDateRange(
            String movieId,
            LocalDate startDate,
            LocalDate endDate
    );
}
