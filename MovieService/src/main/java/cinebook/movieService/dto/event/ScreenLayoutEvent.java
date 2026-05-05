package cinebook.movieService.dto.event;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Min;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScreenLayoutEvent {

    @NotBlank(message = "movieId is required")
    private String movieId;

    @NotBlank(message = "screenId is required")
    @Size(max = 10, message = "screenId must be at most 10 characters")
    private String screenId;

    @NotBlank(message = "theaterId is required")
    private String theaterId;

    @NotNull(message = "rows is required")
    @Min(value = 1, message = "rows must be at least 1")
    private Integer rows;

    @NotNull(message = "cols is required")
    @Min(value = 1, message = "cols must be at least 1")
    private Integer cols;

    @NotNull(message = "premiumCols is required")
    private List<Integer> premiumCols;

    @NotNull(message = "aisleAfterCol is required")
    private Integer aisleAfterCol;

    @NotNull(message = "pricing is required")
    private Pricing pricing;

    private List<String> bookedSeats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pricing {
        private Double premiumPrice;
        private Double regularPrice;
    }
}
