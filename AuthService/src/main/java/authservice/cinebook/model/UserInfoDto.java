package authservice.cinebook.model;

import authservice.cinebook.entities.UserInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;


@JsonNaming (PropertyNamingStrategies.SnakeCaseStrategy.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDto extends UserInfo
{

    @NonNull
    @JsonProperty("first_name")
    private String firstName; // first_name

    @NonNull
    @JsonProperty("last_name")
    private String lastName; //last_name

    @JsonProperty("phone_number")
    private Long phoneNumber;

    @JsonProperty("email")
    private String email; // email

}
