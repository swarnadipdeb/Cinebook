package cinebook.bookingservice.dto.request;

import cinebook.bookingservice.models.BookingSeat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class BookingRequestDTO {

    @NotBlank(message = "reservationId is required")
    private String reservationId;

    @NotBlank(message = "showtimeId is required")
    private String showtimeId;

    @NotBlank(message = "movieId is required")
    private String movieId;

    @NotBlank(message = "theaterId is required")
    private String theaterId;

    @NotBlank(message = "screenId is required")
    private String screenId;

    @NotBlank(message = "time is required")
    @Pattern(
            regexp = "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$",
            message = "time must be in HH:mm:ss format"
    )
    private String time;

    @NotEmpty(message = "seats must not be empty")
    private List<BookingSeat> seats;

    @NotNull(message = "totalPrice is required")
    @Min(value = 0, message = "totalPrice must be greater than 0")
    private Double totalPrice;
}
