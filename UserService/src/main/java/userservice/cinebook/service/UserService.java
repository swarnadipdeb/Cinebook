package userservice.cinebook.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import userservice.cinebook.entities.UserInfo;
import userservice.cinebook.entities.UserInfoDto;
import userservice.cinebook.service.S3Service;

import java.util.Optional;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

@Service
@RequiredArgsConstructor
public class UserService
{
    @Autowired
    private final userservice.cinebook.repository.UserRepository userRepository;

    @Autowired
    private S3Service s3Service;

    public UserInfoDto createOrUpdateUser(UserInfoDto userInfoDto){
        String profilePic = userInfoDto.getProfilePic();
        if (isBase64Image(profilePic)) {
            profilePic = s3Service.uploadProfilePic(profilePic, null);
            userInfoDto.setProfilePic(profilePic);
        }


        UnaryOperator<UserInfo> updatingUser = user -> {
            if(userInfoDto.getProfilePic() ==  null) {
                userInfoDto.setProfilePic(user.getProfilePic());
            }
            return userRepository.save(userInfoDto.transformToUserInfo());
        };

        Supplier<UserInfo> createUser = () -> {
             return userRepository.save(userInfoDto.transformToUserInfo());
        };

        UserInfo userInfo = userRepository.findByUserId(userInfoDto.getUserId())
                .map(updatingUser)
                .orElseGet(createUser);
        return new UserInfoDto(
                userInfo.getUserId(),
                userInfo.getFirstName(),
                userInfo.getLastName(),
                userInfo.getPhoneNumber(),
                userInfo.getEmail(),
                userInfo.getProfilePic()
        );
    }

    public UserInfoDto getUser(String userId) throws Exception{
        Optional<UserInfo> userInfoDtoOpt = userRepository.findByUserId(userId);
        if(userInfoDtoOpt.isEmpty()){
            throw new Exception("User not found");
        }
        UserInfo userInfo = userInfoDtoOpt.get();
        return new UserInfoDto(
                userInfo.getUserId(),
                userInfo.getFirstName(),
                userInfo.getLastName(),
                userInfo.getPhoneNumber(),
                userInfo.getEmail(),
                userInfo.getProfilePic()
        );
    }

    private boolean isBase64Image(String value) {
        return value != null && !value.isEmpty() && value.startsWith("data:");
    }

    public void deleteUser(String userId) throws Exception {
        Optional<UserInfo> userInfoOpt = userRepository.findByUserId(userId);
        if (userInfoOpt.isEmpty()) {
            throw new Exception("User not found");
        }
        UserInfo userInfo = userInfoOpt.get();
        if (userInfo.getProfilePic() != null && userInfo.getProfilePic().contains("/")) {
            s3Service.deleteProfilePic(userInfo.getProfilePic());
        }
        userRepository.delete(userInfo);
    }

}
