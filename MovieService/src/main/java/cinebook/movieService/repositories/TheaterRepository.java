package cinebook.movieService.repositories;

import cinebook.movieService.models.Theater;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TheaterRepository extends MongoRepository<Theater, String> {

    List<Theater> findByIdIn(List<String> ids);

    Optional<Theater> findByName(String name);
}
