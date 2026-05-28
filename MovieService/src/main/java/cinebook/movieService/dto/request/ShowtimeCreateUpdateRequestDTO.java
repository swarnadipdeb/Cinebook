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
public class ShowtimeCreateUpdateRequestDTO {

    @NotBlank(message = "Movie ID is required")
    private String movieId;

    @NotBlank(message = "Theater ID is required")
    private String theaterId;

    @NotNull(message = "Slots are required")
    @Size(min = 1, message = "At least one slot is required")
    private List<ShowtimeSlotCreateUpdateRequestDTO> slots;

    @NotBlank(message = "Format is required")
    private String format;
}
