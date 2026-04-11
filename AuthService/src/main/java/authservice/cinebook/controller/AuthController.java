package authservice.cinebook.controller;

import authservice.cinebook.entities.RefreshToken;
import authservice.cinebook.model.UserDetailsDto;
import authservice.cinebook.model.UserInfoDto;
import authservice.cinebook.response.JwtResponseDTO;
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

import java.util.HashMap;
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
            String userId = userDetailsService.signupUser(userInfoDto);
            if(Objects.isNull(userId)){
                return new ResponseEntity<>("Already Exist", HttpStatus.BAD_REQUEST);
            }
            otpService.sendOtp(userInfoDto.getEmail());
            return  new ResponseEntity<>(userId,HttpStatus.OK);
        }catch (Exception ex){
            return new ResponseEntity<>("Exception in User Service" +" "+ex.getMessage()+" "+ex.getCause(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/auth/v1/signup-otp-verify")
    public ResponseEntity SignUpVerify(@RequestHeader String UserId, @RequestParam String otp, @RequestBody UserDetailsDto userDetailsDto){
            if(userDetailsService.validateSignUpUser(otp,UserId, userDetailsDto)) {
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(UserId);
                String jwtToken = jwtService.GenerateToken(UserId);
                return new ResponseEntity<>(JwtResponseDTO.builder().accessToken(jwtToken).
                        token(refreshToken.getToken()).userId(UserId).build(), HttpStatus.OK);
            }
            return new ResponseEntity<>("Not Verified", HttpStatus.UNAUTHORIZED);
    }



@GetMapping("/auth/v1/ping")
public ResponseEntity<String> ping() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.isAuthenticated()) {
        String userId = userDetailsService.getUserByUsername(authentication.getName());
        if(Objects.nonNull(userId)){
            return ResponseEntity.ok(userId);
        }
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
}

@GetMapping("/health")
public ResponseEntity<Boolean> checkHealth(){
    return new ResponseEntity<>(true, HttpStatus.OK);
}

}
