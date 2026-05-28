package cinebook.bookingservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class ReservationRequestDTO {

    @NotBlank(message = "showtimeId is required")
    private String showtimeId;

    @NotBlank(message = "screenId is required")
    private String screenId;

    @NotEmpty(message = "seats must not be empty")
    @Size(max = 10, message = "maximum 10 seats per reservation")
    private List<String> seats;
}
