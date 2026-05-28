package cinebook.bookingservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserRoleFilter userRoleFilter;

    public SecurityConfig(UserRoleFilter userRoleFilter) {
        this.userRoleFilter = userRoleFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/bookings/movies/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/bookings/screens").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/bookings/screens/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/bookings/screens/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/bookings/screens/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/bookings/reservations").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/bookings/reservations/**").hasAnyRole("USER","ADMIN")
                .requestMatchers(HttpMethod.POST, "/bookings").hasAnyRole("USER","ADMIN")
                .requestMatchers(HttpMethod.GET, "/bookings/**").hasAnyRole("USER","ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(userRoleFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
