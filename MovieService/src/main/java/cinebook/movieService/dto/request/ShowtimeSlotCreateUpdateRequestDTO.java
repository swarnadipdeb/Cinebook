package cinebook.movieService.dto.request;

import cinebook.movieService.exceptions.ValidationException;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

import java.util.List;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSlotCreateUpdateRequestDTO {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

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
