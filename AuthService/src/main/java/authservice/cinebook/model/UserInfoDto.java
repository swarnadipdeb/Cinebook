package authservice.cinebook.model;

import authservice.cinebook.entities.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.util.Set;


@JsonNaming (PropertyNamingStrategies.SnakeCaseStrategy.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDto
{

    @NonNull
    @JsonProperty("user_name")
    private String userName;

    @NonNull
    @JsonProperty("email")
    private String email;

    @NonNull
    @JsonProperty("password")
    private String password;

    @JsonProperty("roles")
    private Set<UserRole> roles;


}
