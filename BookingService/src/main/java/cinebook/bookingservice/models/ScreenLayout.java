package cinebook.bookingservice.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "screenLayouts")
public class ScreenLayout {

    @Id
    private String id;
    private String movieId;
    private String screenId;
    private String theaterId;
    private Integer rows;
    private Integer cols;
    private List<Integer> premiumCols;
    private Integer aisleAfterCol;
    private Pricing pricing;
    private List<String> bookedSeats;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pricing {
        @JsonProperty("premiumPrice")
        private Double premium;

        @JsonProperty("regularPrice")
        private Double regular;
    }
}
