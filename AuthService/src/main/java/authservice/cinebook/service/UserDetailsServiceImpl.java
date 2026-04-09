package authservice.cinebook.service;

import authservice.cinebook.entities.UserInfo;
import authservice.cinebook.eventProducer.UserInfoEvent;
import authservice.cinebook.eventProducer.UserInfoProducer;
import authservice.cinebook.model.UserInfoDto;
import authservice.cinebook.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@AllArgsConstructor
@Data
public class UserDetailsServiceImpl implements UserDetailsService
{

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private final UserInfoProducer userInfoProducer;

    @Autowired
    private final OtpService otpService;


    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException
    {

        log.debug("Entering in loadUserByUsername Method...");
        UserInfo user = userRepository.findByUsername(username);
        if(user == null){
            log.error("Username not found: " + username);
            throw new UsernameNotFoundException("could not found user..!!");
        }
        log.info("User Authenticated Successfully..!!!");
        return new CustomUserDetails(user);
    }

    public UserInfo checkIfUserAlreadyVerified(UserInfoDto userInfoDto){
        UserInfo user = userRepository.findByUsername(userInfoDto.getUsername());
        if(user != null && user.getIsVerified()) return user;
        return null;
    }

    public String signupUser(UserInfoDto userInfoDto){
        //        ValidationUtil.validateUserAttributes(userInfoDto);
        userInfoDto.setPassword(passwordEncoder.encode(userInfoDto.getPassword()));
        if(Objects.nonNull(checkIfUserAlreadyVerified(userInfoDto))){
            return null;
        }
        String userId = UUID.randomUUID().toString();
        UserInfo userInfo = UserInfo.builder()
                        .userId(userId)
                        .username(userInfoDto.getUsername())
                        .isVerified(false)
                        .password(userInfoDto.getPassword())
                        .roles(new HashSet<>())
                        .build();

        userRepository.save(userInfo);
        // pushing EventToQueue
        userInfoProducer.sendEventToKafka(userInfoEventToPublish(userInfoDto, userId));
        return userId;
    }

    public Boolean validateSignUpUser(String email, String otp, String userId){
             if(otpService.verifyOtp(email, otp)){
                UserInfo user =  userRepository.findByUserId(userId);
                user.setIsVerified(true);
                userRepository.save(user);
                return true;
             }
             return false;
    }
    public String getUserByUsername(String userName){
        return Optional.of(userRepository.findByUsername(userName)).map(UserInfo::getUserId).orElse(null);
    }

    public UserInfo getUserInfoByUsername(String userName){
        return userRepository.findByUsername(userName);
    }

    private UserInfoEvent userInfoEventToPublish(UserInfoDto userInfoDto, String userId){
        return UserInfoEvent.builder()
                .userId(userId)
                .firstName(userInfoDto.getFirstName())
                .lastName(userInfoDto.getLastName())
                .email(userInfoDto.getEmail())
                .phoneNumber(userInfoDto.getPhoneNumber()).build();

    }
}