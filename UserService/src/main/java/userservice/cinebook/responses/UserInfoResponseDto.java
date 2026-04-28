package userservice.cinebook.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfoResponseDto {

    @NonNull
    private String username;

    @NonNull
    private String firstName;


    private String lastName;

    private Long phoneNumber;

    @NonNull
    private String email;


    private String profilePic;
}
