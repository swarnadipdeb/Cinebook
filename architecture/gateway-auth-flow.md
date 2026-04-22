# Microservices JWT Authentication with API Gateway

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         KONG GATEWAY                              │
│  - Validates JWT signature & expiration                          │
│  - Extracts user info from JWT                                   │
│  - Forwards request with JWT (or headers)                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    XYZ SERVICE (e.g., Booking)                   │
│                                                                  │
│  Option 1: Extract JWT without validation (trust gateway)         │
│  Option 2: Validate JWT with shared secret                       │
│  Option 3: Read from X-User-* headers                            │
│                                                                  │
│  → Sets SecurityContextHolder.getContext().setAuthentication()    │
│  → @PreAuthorize("hasRole('USER')") works                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Approach 1: XYZ Service Extracts Without Validation (Gateway Validated)

Since **Kong already validated the JWT**, XYZ service just needs to extract the payload. It trusts Kong.

### Option A: Use JwtService without validation

```java
// In XYZ Service - just extract claims, don't validate
@Service
public class JwtService {
    
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
            .unsecured() // Don't verify signature - trust gateway
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
    
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
    
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }
}
```

### Option B: Create a SecurityContextFilter for XYZ Service

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TrustedJwtFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService; // In XYZ service - extracts only, no validation
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // Extract claims (NO validation - trust Kong)
                Claims claims = jwtService.extractAllClaims(token);
                String username = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);
                
                // Create authorities from roles
                List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority(role))
                    .collect(Collectors.toList());
                
                // Set SecurityContext
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (Exception e) {
                // Token invalid/expired - Kong should have caught this, but handle anyway
                SecurityContextHolder.clearContext();
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### SecurityConfig for XYZ Service

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(CorsConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // NO httpBasic(), NO JwtAuthFilter - just TrustJwtFilter handles it
            .build();
    }
}
```

---

## Approach 2: XYZ Service Also Validates (Share Secret)

Both services share the same JWT secret. XYZ service validates itself.

### Same JwtService in XYZ Service

```java
@Service
public class JwtService {
    
    // Same secret as AuthService
    private static final String SECRET = "your-256-bit-secret";
    
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
            .setSigningKey(getSignKey()) // Validate signature
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
```

### FilterChain for XYZ Service

```java
// Same JwtAuthFilter as AuthService
// But WITHOUT DaoAuthenticationProvider - only used for token extraction
// No login endpoint, no UserDetailsServiceImpl.loadUserByUsername()
```

---

## Approach 3: Gateway Forwards User Info in Headers

Kong strips JWT and forwards user info as headers.

### Kong Configuration
```
Upstream Headers:
  X-User-Id: <user_id from JWT>
  X-Username: <username from JWT>
  X-User-Roles: <roles from JWT>
```

### XYZ Service Filter

```java
@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        
        String userId = request.getHeader("X-User-Id");
        String username = request.getHeader("X-Username");
        String rolesHeader = request.getHeader("X-User-Roles");
        
        if (username != null) {
            List<GrantedAuthority> authorities = Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(username, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## Comparison

| Approach | Pros | Cons |
|----------|------|------|
| **1. Extract without validation** | Simple, fast | Trusts Kong implicitly |
| **2. Shared secret validation** | Full validation | Secret must be shared |
| **3. Headers from Kong** | Clean separation | Extra Kong config |

---

## Recommendation

**Option 1 or 2** — JWT should still travel with the request for audit trails and traceability.

**Option 3** is sometimes used when JWT is too large for headers.
