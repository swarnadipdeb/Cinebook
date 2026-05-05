package cinebook.movieService.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @NotBlank(message = "Tagline is required")
    @Size(max = 300, message = "Tagline must be at most 300 characters")
    private String tagline;

    @NotBlank(message = "Poster is required (URL or base64)")
    private String poster;

    @NotBlank(message = "Backdrop is required (URL or base64)")
    private String backdrop;

    @NotNull(message = "Rating is required")
    private Double rating;

    @NotNull(message = "Duration is required")
    private Integer duration;

    @NotNull(message = "Genre is required")
    @Size(min = 1, message = "Genre must not be empty")
    private List<String> genre;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Release date is required")
    private String releaseDate;

    @NotBlank(message = "Director is required")
    private String director;

    @NotNull(message = "Cast is required")
    @Size(min = 1, message = "Cast must not be empty")
    private List<String> cast;

    @NotBlank(message = "Description is required")
    private String description;
}
