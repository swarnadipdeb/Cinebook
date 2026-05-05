package cinebook.movieService.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieUpdateRequestDTO {

    private String title;

    private String tagline;

    private String poster;

    private String backdrop;

    private Double rating;

    private Integer duration;

    private List<String> genre;

    private String language;

    private String releaseDate;

    private String director;

    private List<String> cast;

    private String description;
}
