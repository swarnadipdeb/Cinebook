package authservice.cinebook.controller;

import authservice.cinebook.entities.RefreshToken;
import authservice.cinebook.entities.UserInfo;
import authservice.cinebook.request.AuthRequestDTO;
import authservice.cinebook.request.RefreshTokenRequestDTO;
import authservice.cinebook.response.JwtResponseDTO;
import authservice.cinebook.service.JwtService;
import authservice.cinebook.service.RefreshTokenService;
import authservice.cinebook.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Objects;
import java.util.Optional;

@Controller
public class TokenController
{

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/auth/v1/login")
    public ResponseEntity AuthenticateAndGetToken(@RequestBody AuthRequestDTO authRequestDTO){
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequestDTO.getUsername(), authRequestDTO.getPassword()));
        if(authentication.isAuthenticated()){
            UserInfo userInfo = userDetailsService.getUserInfoByUsername(authRequestDTO.getUsername());
            if(refreshTokenService.tokenExistsByUserInfo(userInfo)){
                RefreshToken rToken = refreshTokenService.getTokenByUserInfo(userInfo);
                refreshTokenService.deleteToken(rToken);
            }
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(authRequestDTO.getUsername());
            String userId = userDetailsService.getUserByUsername(authRequestDTO.getUsername());

            if(Objects.nonNull(userId) && Objects.nonNull(refreshToken)){
                return new ResponseEntity<>(JwtResponseDTO.builder()
                        .accessToken(jwtService.GenerateToken(authRequestDTO.getUsername()))
                        .token(refreshToken.getToken())
                        .build(), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>("Exception in Auth Service", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @PostMapping("/auth/v1/refreshToken")
    public ResponseEntity refreshToken(@RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO){
        Optional<RefreshToken> rkf = refreshTokenService.findByToken(refreshTokenRequestDTO.getToken());
        return refreshTokenService.findByToken(refreshTokenRequestDTO.getToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserInfo)
                .map(userInfo -> {
                    String accessToken = jwtService.GenerateToken(userInfo.getUserName());
                    return new ResponseEntity<>(JwtResponseDTO.builder()
                            .accessToken(accessToken)
                            .token(refreshTokenRequestDTO.getToken()).build(),HttpStatus.OK);
                }).orElseThrow(() ->new RuntimeException("Refresh Token is not in DB..!!"));
    }

}
