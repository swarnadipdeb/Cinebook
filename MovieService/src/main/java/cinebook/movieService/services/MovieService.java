package cinebook.movieService.services;

import cinebook.movieService.dto.request.MovieRequestDTO;
import cinebook.movieService.dto.request.MovieUpdateRequestDTO;
import cinebook.movieService.dto.response.MovieResponseDTO;
import cinebook.movieService.dto.response.MovieUpdateResponseDTO;
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
    private final S3Service s3Service;

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
        try {
            validateMovieRequest(request);

            String posterUrl = resolveImage(request.getPoster(), "poster");
            String backdropUrl = resolveImage(request.getBackdrop(), "backdrop");

            Movie movie = Movie.builder()
                    .title(request.getTitle())
                    .tagline(request.getTagline())
                    .poster(posterUrl)
                    .backdrop(backdropUrl)
                    .rating(request.getRating())
                    .duration(request.getDuration())
                    .genre(request.getGenre())
                    .language(request.getLanguage())
                    .releaseDate(request.getReleaseDate())
                    .director(request.getDirector())
                    .cast(request.getCast())
                    .description(request.getDescription())
                    .build();

            movie = movieRepository.save(movie);
            return toResponseDTO(movie);
        }catch (Exception e) {
            System.err.println(e.getMessage());
            return null;
        }
    }

    public MovieUpdateResponseDTO updateMovie(String id, MovieUpdateRequestDTO request) {
        Movie existing = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie with ID '" + id + "' not found"));

        if (request.getTitle() != null) existing.setTitle(request.getTitle());
        if (request.getTagline() != null) existing.setTagline(request.getTagline());
        if (request.getPoster() != null) existing.setPoster(resolveImage(request.getPoster(), "poster"));
        if (request.getBackdrop() != null) existing.setBackdrop(resolveImage(request.getBackdrop(), "backdrop"));
        if (request.getRating() != null) {
            ValidationUtils.validateRating(request.getRating());
            existing.setRating(request.getRating());
        }
        if (request.getDuration() != null) {
            ValidationUtils.validateDuration(request.getDuration());
            existing.setDuration(request.getDuration());
        }
        if (request.getGenre() != null && !request.getGenre().isEmpty()) existing.setGenre(request.getGenre());
        if (request.getLanguage() != null) existing.setLanguage(request.getLanguage());
        if (request.getReleaseDate() != null) existing.setReleaseDate(request.getReleaseDate());
        if (request.getDirector() != null) existing.setDirector(request.getDirector());
        if (request.getCast() != null && !request.getCast().isEmpty()) existing.setCast(request.getCast());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());

        existing = movieRepository.save(existing);
        return toUpdateResponseDTO(existing);
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

    private void validateMovieRequest(MovieRequestDTO request) {
        validateImage(request.getPoster(), "Poster");
        validateImage(request.getBackdrop(), "Backdrop");
        ValidationUtils.validateRating(request.getRating());
        ValidationUtils.validateDuration(request.getDuration());
        ValidationUtils.validateDate(request.getReleaseDate());
    }

    private void validateImage(String data, String fieldName) {
        if (data == null || data.isBlank()) {
            throw new ValidationException(fieldName + " is required");
        }
        if (data.startsWith("http://") || data.startsWith("https://")) {
            return;
        }
        String cleaned = data.contains(",") ? data.substring(data.indexOf(',') + 1) : data;
        try {
            java.util.Base64.getDecoder().decode(cleaned.trim());
        } catch (IllegalArgumentException e) {
            throw new ValidationException(fieldName + " must be a valid URL or base64 encoded image");
        }
    }

    private String resolveImage(String data, String type) {
        if (data == null) return null;
        if (data.startsWith("http://") || data.startsWith("https://")) {
            return data;
        }
        return s3Service.uploadImage(data, type);
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
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }

    private MovieUpdateResponseDTO toUpdateResponseDTO(Movie movie) {
        return MovieUpdateResponseDTO.builder()
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
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }
}
