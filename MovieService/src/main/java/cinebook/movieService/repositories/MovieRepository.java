package cinebook.movieService.repositories;

import cinebook.movieService.models.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends MongoRepository<Movie, String> {

    @Query(value = "{}", fields = "{ 'title': 1, '_id': 1 }")
    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query(value = "{ 'genre': ?0 }")
    Page<Movie> findByGenre(String genre, Pageable pageable);

    @Query(value = "{ 'genre': { $in: ?0 } }")
    Page<Movie> findByGenreIn(List<String> genres, Pageable pageable);

    @Query(value = "{ 'language': ?0 }")
    Page<Movie> findByLanguage(String language, Pageable pageable);

    @Query("{ $or: [ { title: { $regex: ?0, $options: 'i' } }, { genre: { $in: [?0] } } ] }")
    Page<Movie> searchByTitleOrGenre(String query, Pageable pageable);

    @Query("{ $or: [ { title: { $regex: ?0, $options: 'i' } }, { genre: { $in: ?1 } } ] }")
    Page<Movie> searchByTitleOrGenreList(String titleQuery, List<String> genreQuery, Pageable pageable);
}
