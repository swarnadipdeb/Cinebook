package authservice.cinebook.response;


import authservice.cinebook.entities.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PingResponseDTO {

    private String userId;
    private Set<UserRole> roles;
}
