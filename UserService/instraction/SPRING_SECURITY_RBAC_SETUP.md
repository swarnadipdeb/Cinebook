# Spring Security RBAC Setup Instructions

## For any Spring Boot project

---

## 1. Add dependency to `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

---

## 2. Create `UserRoleAuthenticationToken.java`

```java
package com.example.yourpackage.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Collectors;

public class UserRoleAuthenticationToken extends AbstractAuthenticationToken {

    private final String userId;
    private final String username;

    public UserRoleAuthenticationToken(String userId, String username, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.userId = userId;
        this.username = username;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() { return null; }

    @Override
    public Object getPrincipal() { return userId; }

    public String getUsername() { return username; }

    public static Collection<? extends GrantedAuthority> parseRoles(String roles) {
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
```

---

## 3. Create `UserRoleFilter.java`

```java
package com.example.yourpackage.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class UserRoleFilter extends OncePerRequestFilter {

    private static final String USER_ID_HEADER = "X-User-ID";
    private static final String USER_NAME_HEADER = "X-User-Name";
    private static final String USER_ROLES_HEADER = "X-User-Roles";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader(USER_ID_HEADER);
        String username = request.getHeader(USER_NAME_HEADER);
        String roles = request.getHeader(USER_ROLES_HEADER);

        if (userId != null && roles != null) {
            var authorities = UserRoleAuthenticationToken.parseRoles(roles);
            var authentication = new UserRoleAuthenticationToken(userId, username, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## 4. Create `SecurityConfig.java`

```java
package com.example.yourpackage.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                .anyRequest().authenticated()
            )
            .addFilterBefore(userRoleFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 5. Update controllers

In any controller, inject the security context:

```java
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.yourpackage.security.UserRoleAuthenticationToken;

private String getUserIdFromContext() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth instanceof UserRoleAuthenticationToken token) {
        return (String) token.getPrincipal();
    }
    return null;
}

private String getUsernameFromContext() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth instanceof UserRoleAuthenticationToken token) {
        return token.getUsername();
    }
    return null;
}
```

Then add `@PreAuthorize` annotations:

```java
@GetMapping("/resource")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public ResponseEntity<?> getResource() { ... }

@DeleteMapping("/admin/resource")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> deleteResource() { ... }
```

---

## 6. Required headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-User-ID` | Yes | User identifier |
| `X-User-Name` | No | Username (optional) |
| `X-User-Roles` | Yes | Comma-separated roles (e.g., `ROLE_USER,ROLE_ADMIN`) |

---

## Behavior Notes

- If `X-User-ID` or `X-User-Roles` is missing, authentication fails and Spring Security returns **403 Forbidden**
- `X-User-Name` is optional and can be null
- The filter runs once per request via `OncePerRequestFilter`
- Use `@PreAuthorize` for role checks before method execution
- Use `@PostAuthorize` when you need to inspect the returned object (e.g., ownership checks)