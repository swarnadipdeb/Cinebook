package authservice.cinebook.controller;

import authservice.cinebook.entities.RefreshToken;
import authservice.cinebook.entities.UserInfo;
import authservice.cinebook.model.UserDetailsDto;
import authservice.cinebook.model.UserInfoDto;
import authservice.cinebook.response.JwtResponseDTO;
import authservice.cinebook.response.PingResponseDTO;
import authservice.cinebook.response.SignUpResponseDTO;
import authservice.cinebook.service.JwtService;
import authservice.cinebook.service.OtpService;
import authservice.cinebook.service.RefreshTokenService;
import authservice.cinebook.service.UserDetailsServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@AllArgsConstructor
@RestController
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private OtpService otpService;

    @PostMapping("/auth/v1/signup")
    public ResponseEntity SignUp(@RequestBody UserInfoDto userInfoDto){
        try{
            String userName = userDetailsService.signupUser(userInfoDto);
            if(Objects.isNull(userName)){
                return new ResponseEntity<>("Already Exist", HttpStatus.BAD_REQUEST);
            }
            otpService.sendOtp(userInfoDto.getEmail());
            return  new ResponseEntity<>(SignUpResponseDTO.builder().userName(userName).build(),HttpStatus.OK);
        }catch (Exception ex){
            return new ResponseEntity<>("Exception in User Service" +" "+ex.getMessage()+" "+ex.getCause(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/auth/v1/signup-otp-verify")
    public ResponseEntity SignUpVerify(@RequestHeader String userName, @RequestParam String otp, @RequestBody UserDetailsDto userDetailsDto){
            if(userDetailsService.validateSignUpUser(otp,userName, userDetailsDto)) {
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(userName);
                String jwtToken = jwtService.GenerateToken(userName);
                return new ResponseEntity<>(JwtResponseDTO.builder().accessToken(jwtToken).
                        token(refreshToken.getToken()).username(userName).build(), HttpStatus.OK);
            }
            return new ResponseEntity<>("Not Verified", HttpStatus.UNAUTHORIZED);
    }



@GetMapping("/auth/v1/ping")
public ResponseEntity ping() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.isAuthenticated()) {
        UserInfo user = userDetailsService.getUserInfoByUsername(authentication.getName());
        if(Objects.nonNull(user)){
            return ResponseEntity.ok(PingResponseDTO.builder().userId(user.getUserId()).roles(
                    user.getRoles()
            ).build());
        }
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
}

@GetMapping("/health")
public ResponseEntity<Boolean> checkHealth(){
    return new ResponseEntity<>(true, HttpStatus.OK);
}

}
