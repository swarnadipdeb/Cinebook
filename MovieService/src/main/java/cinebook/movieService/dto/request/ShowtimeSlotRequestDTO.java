package cinebook.movieService.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSlotRequestDTO {

    @NotBlank(message = "Time is required")
    private String time;

    @NotBlank(message = "Date is required")
    private String date;

    private Double premiumPrice;

    private Double regularPrice;

    private Integer rows;

    private Integer cols;

    private List<Integer> premiumCols;

    private Integer aisleAfterCol;
}
