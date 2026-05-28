package cinebook.bookingservice.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSeat {
    private String row;
    private Integer col;
    private String type;
    private Double price;
}
