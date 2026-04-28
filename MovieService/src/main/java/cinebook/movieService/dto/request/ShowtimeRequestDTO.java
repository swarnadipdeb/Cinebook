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
public class ShowtimeRequestDTO {

    @NotBlank(message = "Movie ID is required")
    private String movieId;

    @NotBlank(message = "Theater ID is required")
    private String theaterId;

    @NotBlank(message = "Date is required")
    private String date;

    @NotNull(message = "Times are required")
    @Size(min = 1, message = "At least one time is required")
    private List<String> times;

    @NotBlank(message = "Screen is required")
    private String screen;

    @NotBlank(message = "Format is required")
    private String format;
}
