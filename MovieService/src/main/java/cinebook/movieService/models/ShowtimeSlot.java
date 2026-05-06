package cinebook.movieService.models;

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
public class ShowtimeSlot {

    private String screenId;

    @NotBlank(message = "Time is required")
    private String time;

    @NotBlank(message = "Date is required")
    private String date;
}
