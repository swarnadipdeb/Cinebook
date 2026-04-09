package authservice.cinebook.repository;

import authservice.cinebook.entities.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailOrderByExpiresAtDesc(String email);
    void deleteByEmail(String email);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
