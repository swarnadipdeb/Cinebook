package authservice.cinebook.service;

import authservice.cinebook.entities.OtpToken;
import authservice.cinebook.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpTokenRepository otpRepo;
    @Autowired
    private JavaMailSender mailSender;

    @Value("${otp.expiry.minutes}") private int expiryMinutes;

    // 1. Generate & send OTP
    public void sendOtp(String email) throws MailException {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit

        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        token.setVerified(false);
        otpRepo.save(token);

        sendEmail(email, otp);
    }

    // 2. Verify OTP
    public boolean verifyOtp(String email, String otp) {
        Optional<OtpToken> tokenOpt = otpRepo.findTopByEmailOrderByExpiresAtDesc(email);

        if (tokenOpt.isEmpty()) return false;

        OtpToken token = tokenOpt.get();

        if (token.isVerified())                             return false; // already used
        if (!token.getOtp().equals(otp))                   return false; // wrong OTP
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) return false; // expired

        token.setVerified(true);
        otpRepo.save(token);
        return true;
    }

    // 3. Send email
    private void sendEmail(String to, String otp) throws MailException {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Your OTP Code");
        msg.setText("Your OTP is: " + otp + "\nValid for " + expiryMinutes + " minutes.");
        mailSender.send(msg);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanExpiredOtps() {
        otpRepo.deleteByExpiresAtBefore(LocalDateTime.now().minusMinutes(10));
        System.out.println("Expired OTPs cleaned at: " + LocalDateTime.now());
    }
}
