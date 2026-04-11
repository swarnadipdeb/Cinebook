package authservice.cinebook.model;


import authservice.cinebook.entities.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserDetailsDto {

    @NonNull
    @JsonProperty("first_name")
    private String firstName; // first_name

    @NonNull
    @JsonProperty("last_name")
    private String lastName; //last_name

    @JsonProperty("phone_number")
    private Long phoneNumber;
}
