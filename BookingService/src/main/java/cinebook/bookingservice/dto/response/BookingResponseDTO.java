package cinebook.bookingservice.dto.response;

import cinebook.bookingservice.models.BookingSeat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    private String id;
    private String bookingId;
    private String userId;
    private String movieId;
    private String showtimeId;
    private String theaterId;
    private String time;
    private String screenId;
    private List<BookingSeat> seats;
    private Double totalPrice;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
