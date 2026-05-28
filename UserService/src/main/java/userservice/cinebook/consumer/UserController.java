package userservice.cinebook.consumer;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import userservice.cinebook.entities.UserInfoDto;
import userservice.cinebook.responses.UserInfoResponseDto;
import userservice.cinebook.security.UserRoleAuthenticationToken;
import userservice.cinebook.service.S3Service;
import userservice.cinebook.service.UserService;

@RestController
@RequiredArgsConstructor
public class UserController
{

    @Autowired
    private UserService userService;

    @Autowired
    private S3Service s3Service;

    private String getUserIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserRoleAuthenticationToken token) {
            return (String) token.getPrincipal();
        }
        return null;
    }

    private String getUsernameFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserRoleAuthenticationToken token) {
            return token.getUsername();
        }
        return null;
    }

    @GetMapping("/user/v1/getUser")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponseDto> getUser(){
        try{
            String userId = getUserIdFromContext();
            String username = getUsernameFromContext();
            UserInfoDto user = userService.getUser(userId);
            return new ResponseEntity<>(UserInfoResponseDto.builder().username(username).
                    firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .phoneNumber(user.getPhoneNumber())
                    .email(user.getEmail())
                    .profilePic(user.getProfilePic()).build(), HttpStatus.OK);
        }catch (Exception ex){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/user/v1/createUpdate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoDto> createUpdateUser(@RequestBody UserInfoDto userInfoDto){
        try{
            String userId = getUserIdFromContext();
            userInfoDto.setUserId(userId);
            UserInfoDto user = userService.createOrUpdateUser(userInfoDto);
            return new ResponseEntity<>(user, HttpStatus.OK);
        }catch (Exception ex){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/user/v1/deleteUser")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser() {
        try {
            String userId = getUserIdFromContext();
            userService.deleteUser(userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception ex) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Boolean> checkHealth(){
        return new ResponseEntity<>(true, HttpStatus.OK);
    }
}