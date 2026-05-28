package cinebook.bookingservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookedSeatsUpdateDTO {

    @NotBlank(message = "operation is required")
    private String operation;

    @NotNull(message = "seats is required")
    private List<String> seats;
}
