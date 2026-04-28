package cinebook.movieService.services;

import cinebook.movieService.dto.request.MovieRequestDTO;
import cinebook.movieService.dto.response.MovieResponseDTO;
import cinebook.movieService.dto.response.PaginatedResponse;
import cinebook.movieService.exceptions.ResourceNotFoundException;
import cinebook.movieService.exceptions.ValidationException;
import cinebook.movieService.models.Movie;
import cinebook.movieService.models.Showtime;
import cinebook.movieService.repositories.MovieRepository;
import cinebook.movieService.repositories.ShowtimeRepository;
import cinebook.movieService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MongoTemplate mongoTemplate;

    public PaginatedResponse<MovieResponseDTO> getAllMovies(
            int page, int size, String genre, String language, String sortBy, String sortDir) {

        Criteria criteria = buildFilterCriteria(genre, language);

        long total = criteria != null
                ? mongoTemplate.count(new Query(criteria), Movie.class)
                : movieRepository.count();

        String field = resolveSortField(sortBy);
        Sort.Direction direction = sortDir != null && "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Query pageQuery = criteria != null ? new Query(criteria) : new Query();
        pageQuery.with(Sort.by(direction, field));
        pageQuery.skip((long) page * size);
        pageQuery.limit(size);

        List<Movie> pageMovies = mongoTemplate.find(pageQuery, Movie.class);

        List<MovieResponseDTO> content = pageMovies.stream()
                .map(this::toResponseDTO)
                .toList();

        int totalPages = (int) Math.ceil((double) total / size);

        return PaginatedResponse.<MovieResponseDTO>builder()
                .content(content)
                .totalElements((int) total)
                .totalPages(totalPages)
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private Criteria buildFilterCriteria(String genre, String language) {
        if (genre != null && !genre.isBlank() && language != null && !language.isBlank()) {
            return Criteria.where("genre").is(genre);
        } else if (genre != null && !genre.isBlank()) {
            return Criteria.where("genre").in(List.of(genre.split(",")));
        } else if (language != null && !language.isBlank()) {
            return Criteria.where("language").is(language);
        }
        return null;
    }

    private String resolveSortField(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return switch (sortBy) {
            case "rating", "duration", "title", "releaseDate" -> sortBy;
            default -> "createdAt";
        };
    }

    public MovieResponseDTO getMovieById(String id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie with ID '" + id + "' not found"));
        return toResponseDTO(movie);
    }

    public List<MovieResponseDTO> searchMovies(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        Page<Movie> results = movieRepository.searchByTitleOrGenre(query, PageRequest.of(0, 50));
        return results.getContent().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public MovieResponseDTO createMovie(MovieRequestDTO request) {
        validateMovieRequest(request);

        Movie movie = Movie.builder()
                .title(request.getTitle())
                .tagline(request.getTagline())
                .poster(request.getPoster())
                .backdrop(request.getBackdrop())
                .rating(request.getRating())
                .duration(request.getDuration())
                .genre(request.getGenre())
                .language(request.getLanguage())
                .releaseDate(request.getReleaseDate())
                .director(request.getDirector())
                .cast(request.getCast())
                .description(request.getDescription())
                .premiumPrice(request.getPremiumPrice())
                .regularPrice(request.getRegularPrice())
                .build();

        movie = movieRepository.save(movie);
        return toResponseDTO(movie);
    }

    public MovieResponseDTO updateMovie(String id, MovieRequestDTO request) {
        Movie existing = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie with ID '" + id + "' not found"));

        validateMovieRequest(request);

        existing.setTitle(request.getTitle());
        existing.setTagline(request.getTagline());
        existing.setPoster(request.getPoster());
        existing.setBackdrop(request.getBackdrop());
        existing.setRating(request.getRating());
        existing.setDuration(request.getDuration());
        existing.setGenre(request.getGenre());
        existing.setLanguage(request.getLanguage());
        existing.setReleaseDate(request.getReleaseDate());
        existing.setDirector(request.getDirector());
        existing.setCast(request.getCast());
        existing.setDescription(request.getDescription());
        existing.setPremiumPrice(request.getPremiumPrice());
        existing.setRegularPrice(request.getRegularPrice());

        existing = movieRepository.save(existing);
        return toResponseDTO(existing);
    }

    public MovieResponseDTO patchMovie(String id, MovieRequestDTO request) {
        Movie existing = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie with ID '" + id + "' not found"));

        applyPartialUpdate(existing, request);
        existing = movieRepository.save(existing);
        return toResponseDTO(existing);
    }

    public void deleteMovie(String id) {
        Optional<Movie> movie = movieRepository.findById(id);
        if (movie.isEmpty()) {
            throw new ResourceNotFoundException("Movie with ID '" + id + "' not found");
        }
        List<Showtime> associatedShowtimes = showtimeRepository.findByMovieId(id);
        if (!associatedShowtimes.isEmpty()) {
            showtimeRepository.deleteAll(associatedShowtimes);
        }
        movieRepository.deleteById(id);
    }

    private void applyPartialUpdate(Movie movie, MovieRequestDTO request) {
        if (request.getTitle() != null) movie.setTitle(request.getTitle());
        if (request.getTagline() != null) movie.setTagline(request.getTagline());
        if (request.getPoster() != null) movie.setPoster(request.getPoster());
        if (request.getBackdrop() != null) movie.setBackdrop(request.getBackdrop());
        if (request.getRating() != null) {
            ValidationUtils.validateRating(request.getRating());
            movie.setRating(request.getRating());
        }
        if (request.getDuration() != null) {
            ValidationUtils.validateDuration(request.getDuration());
            movie.setDuration(request.getDuration());
        }
        if (request.getGenre() != null && !request.getGenre().isEmpty()) movie.setGenre(request.getGenre());
        if (request.getLanguage() != null) movie.setLanguage(request.getLanguage());
        if (request.getReleaseDate() != null) movie.setReleaseDate(request.getReleaseDate());
        if (request.getDirector() != null) movie.setDirector(request.getDirector());
        if (request.getCast() != null && !request.getCast().isEmpty()) movie.setCast(request.getCast());
        if (request.getDescription() != null) movie.setDescription(request.getDescription());
        if (request.getPremiumPrice() != null) {
            ValidationUtils.validatePrice(request.getPremiumPrice(), "Premium price");
            movie.setPremiumPrice(request.getPremiumPrice());
        }
        if (request.getRegularPrice() != null) {
            ValidationUtils.validatePrice(request.getRegularPrice(), "Regular price");
            movie.setRegularPrice(request.getRegularPrice());
        }
    }

    private void validateMovieRequest(MovieRequestDTO request) {
        ValidationUtils.validateUrl(request.getPoster(), "Poster");
        ValidationUtils.validateUrl(request.getBackdrop(), "Backdrop");
        ValidationUtils.validateRating(request.getRating());
        ValidationUtils.validateDuration(request.getDuration());
        ValidationUtils.validatePrice(request.getPremiumPrice(), "Premium price");
        ValidationUtils.validatePrice(request.getRegularPrice(), "Regular price");
        ValidationUtils.validateDate(request.getReleaseDate());
    }

    private MovieResponseDTO toResponseDTO(Movie movie) {
        return MovieResponseDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .tagline(movie.getTagline())
                .poster(movie.getPoster())
                .backdrop(movie.getBackdrop())
                .rating(movie.getRating())
                .duration(movie.getDuration())
                .genre(movie.getGenre())
                .language(movie.getLanguage())
                .releaseDate(movie.getReleaseDate())
                .director(movie.getDirector())
                .cast(movie.getCast())
                .description(movie.getDescription())
                .premiumPrice(movie.getPremiumPrice())
                .regularPrice(movie.getRegularPrice())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }
}
