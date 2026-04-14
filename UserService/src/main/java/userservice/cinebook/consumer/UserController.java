package userservice.cinebook.consumer;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import userservice.cinebook.entities.UserInfoDto;
import userservice.cinebook.service.UserService;

@RestController
@RequiredArgsConstructor
public class UserController
{

    @Autowired
    private UserService userService;

    @GetMapping("/user/v1/getUser")
    public ResponseEntity<UserInfoDto> getUser(@RequestHeader(value = "X-User-ID") @NonNull String userId){
        try{
            UserInfoDto user = userService.getUser(userId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        }catch (Exception ex){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/user/v1/createUpdate")
    public ResponseEntity<UserInfoDto> createUpdateUser(@RequestHeader(value = "X-User-ID") @NonNull String userId, @RequestBody UserInfoDto userInfoDto){
        try{
            userInfoDto.setUserId(userId);
            UserInfoDto user = userService.createOrUpdateUser(userInfoDto);
            return new ResponseEntity<>(user, HttpStatus.OK);
        }catch (Exception ex){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/health")
    public ResponseEntity<Boolean> checkHealth(){
        return new ResponseEntity<>(true, HttpStatus.OK);
    }
}
