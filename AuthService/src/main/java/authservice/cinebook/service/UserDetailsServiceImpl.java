package authservice.cinebook.service;

import authservice.cinebook.entities.UserInfo;
import authservice.cinebook.eventProducer.UserInfoEvent;
import authservice.cinebook.eventProducer.UserInfoProducer;
import authservice.cinebook.model.UserDetailsDto;
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
        UserInfo user = userRepository.findByUserName(username);
        if(user == null){
            log.error("Username not found: " + username);
            throw new UsernameNotFoundException("could not found user..!!");
        }
        log.info("User Authenticated Successfully..!!!");
        return new CustomUserDetails(user);
    }

    public UserInfo checkIfUserAlreadyExist(UserInfoDto userInfoDto){
        UserInfo user1 =  userRepository.findByEmail(userInfoDto.getEmail());
        UserInfo user2 =  userRepository.findByUserName(userInfoDto.getUserName());
        if(Objects.nonNull(user1) || Objects.nonNull(user2)){
            return user1;
        }
            return null;
    }

    public String signupUser(UserInfoDto userInfoDto){
        //        ValidationUtil.validateUserAttributes(userInfoDto);
        userInfoDto.setPassword(passwordEncoder.encode(userInfoDto.getPassword()));
        UserInfo user  = checkIfUserAlreadyExist(userInfoDto);
        if(user != null && user.getIsVerified()){
            return null;
        }
        if(user != null){
            return user.getUserId();
        }

        String userId = UUID.randomUUID().toString();
        UserInfo userInfo = UserInfo.builder()
                        .userId(userId)
                        .email(userInfoDto.getEmail())
                        .userName(userInfoDto.getUserName())
                        .isVerified(false)
                        .password(userInfoDto.getPassword())
                        .roles(userInfoDto.getRoles())
                        .build();

        userRepository.save(userInfo);
        return userId;
    }

    public Boolean validateSignUpUser(String otp, String userId, UserDetailsDto userDetailsDto){
        UserInfo user =  userRepository.findByUserId(userId);
             if(otpService.verifyOtp(user.getEmail(), otp)){
                user.setIsVerified(true);
                userRepository.save(user);
                UserInfoEvent userEvert = UserInfoEvent.builder().
                                userId(userId)
                               .firstName(userDetailsDto.getFirstName())
                               .lastName(userDetailsDto.getLastName())
                               .email(user.getEmail())
                               .phoneNumber(userDetailsDto.getPhoneNumber()).build();
                 // pushing EventToQueue
                 userInfoProducer.sendEventToKafka(userEvert);
                return true;
             }

             return false;
    }
    public String getUserByUsername(String userName){
        return Optional.of(userRepository.findByUserName(userName)).map(UserInfo::getUserId).orElse(null);
    }

    public UserInfo getUserInfoByUsername(String userName){
        return userRepository.findByUserName(userName);
    }
}