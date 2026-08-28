package cinebook.bookingservice.repositories;

import cinebook.bookingservice.models.ScreenLayout;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenLayoutRepository extends MongoRepository<ScreenLayout, String> {

    ScreenLayout findByMovieIdAndScreenIdAndTheaterId(String movieId, String screenId, String theaterId);

    ScreenLayout findByMovieIdAndScreenId(String movieId, String screenId);

    List<ScreenLayout> findByMovieIdAndTheaterId(String movieId, String theaterId);

    ScreenLayout findByScreenId(String screenId);

    void deleteByIdIn(List<String> ids);

    void deleteByScreenIdIn(List<String> screenIds);

    List<ScreenLayout> findByMovieIdAndScreenIdIn(String movieId, List<String> screenIds);
}
