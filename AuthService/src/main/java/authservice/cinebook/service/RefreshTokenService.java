package authservice.cinebook.service;

import authservice.cinebook.entities.RefreshToken;
import authservice.cinebook.entities.UserInfo;
import authservice.cinebook.repository.RefreshTokenRepository;
import authservice.cinebook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    @Autowired
    UserRepository userRepository;

    public RefreshToken createRefreshToken(String username){
        UserInfo userInfoExtracted = userRepository.findByUserName(username);
        RefreshToken refreshToken = RefreshToken.builder()
                    .userInfo(userInfoExtracted)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(Instant.now().plusSeconds(10800))
                    .build();
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }

    public boolean tokenExistsByUserInfo(UserInfo userId){
        return refreshTokenRepository.existsByUserInfo(userId);
    }

    public RefreshToken getTokenByUserInfo(UserInfo userInfo){
        return refreshTokenRepository.findByUserInfo(userInfo);
    }

    public void deleteToken(RefreshToken token){
        refreshTokenRepository.delete(token);
    }



    public RefreshToken verifyExpiration(RefreshToken token){
        if(token.getExpiryDate().compareTo(Instant.now())<0){
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token is expired. Please make a new login..!");
        }
        return token;
    }

}