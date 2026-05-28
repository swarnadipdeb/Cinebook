package cinebook.bookingservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDTO {
    private String id;
    private String showtimeId;
    private String screenId;
    private List<String> seats;
    private String userId;
    private Date expiresAt;
    private LocalDateTime createdAt;
}
