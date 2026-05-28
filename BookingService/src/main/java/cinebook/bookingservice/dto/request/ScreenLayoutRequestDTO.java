package cinebook.bookingservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class ScreenLayoutRequestDTO {

    @NotBlank(message = "movieId is required")
    private String movieId;

    @NotBlank(message = "screenId is required")
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

    private Integer aisleAfterCol;

    @NotNull(message = "pricing is required")
    private Pricing pricing;

    private List<String> bookedSeats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pricing {
        @JsonProperty("premiumPrice")
        @NotNull(message = "premium price is required")
        @Min(value = 0, message = "premium price must be greater than 0")
        private Double premium;

        @JsonProperty("regularPrice")
        @NotNull(message = "regular price is required")
        @Min(value = 0, message = "regular price must be greater than 0")
        private Double regular;
    }
}
