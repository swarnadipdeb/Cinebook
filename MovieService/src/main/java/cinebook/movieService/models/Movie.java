package cinebook.movieService.models;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "movies")
public class Movie {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @NotBlank(message = "Tagline is required")
    @Size(max = 300, message = "Tagline must be at most 300 characters")
    private String tagline;

    @NotBlank(message = "Poster URL is required")
    private String poster;

    @NotBlank(message = "Backdrop URL is required")
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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}




