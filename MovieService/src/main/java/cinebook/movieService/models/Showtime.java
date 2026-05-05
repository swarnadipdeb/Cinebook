package cinebook.movieService.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "showtimes")
public class Showtime {

    @Id
    private String id;

    @NotBlank(message = "Movie ID is required")
    @Field
    private String movieId;

    @NotBlank(message = "Theater ID is required")
    @Field
    private String theaterId;

    @NotNull(message = "Slots are required")
    @Size(min = 1, message = "At least one slot is required")
    private List<ShowtimeSlot> slots;

    @NotBlank(message = "Format is required")
    private String format;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
