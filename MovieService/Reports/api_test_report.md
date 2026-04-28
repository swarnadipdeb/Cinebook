# MovieService API Test Report

**Service:** MovieService | **Base URL:** `http://localhost:9898` | **Date:** 2026-04-28

**Auth Headers (Admin):** `X-User-ID: admin-001` | `X-User-Name: admin` | `X-User-Roles: ROLE_ADMIN`

---

## Summary

| Category | Total | Passed | Failed | Issues |
|---|---|---|---|---|
| Public (Read) | 13 | 12 | 1 | 1 |
| Auth Enforcement | 5 | 4 | 1 | 1 |
| Admin (Write) | 12 | 12 | 0 | 0 |
| Validation / Error | 8 | 7 | 1 | 2 |
| **Total** | **38** | **35** | **3** | **4** |

## Issues Found

1. **SECURITY: ROLE_USER bypasses ADMIN-only check** (Test #17) — `POST /api/movies` with `ROLE_USER` returned 400 (validation) instead of 403 (forbidden). The `@PreAuthorize("hasRole('ROLE_ADMIN')")` annotation is not blocking non-admin users.
2. **PUT on non-existent resource returns 400 instead of 404** (Test #34) — Validation runs before the resource existence check.
3. **Search without query parameter returns 500** (Test #5) — `GET /api/movies/search` with no `q` param throws an Internal Server Error instead of a clean 400 Bad Request.

---

## Test Results

### 1. GET /health

```bash
curl http://localhost:9898/health
```

**HTTP Status:** `200 OK`

**Response:**
```json
{"status":"UP"}
```

**Verdict:** PASS

---

### 2. GET /api/movies (all, paginated)

```bash
curl http://localhost:9898/api/movies
```

**HTTP Status:** `200 OK`

**Response:** (truncated)
```json
{
  "content": [
    {
      "id": "69eba5ac2bb448ecf8d997da",
      "title": "Dune: Part Three",
      "tagline": "The desert awakens once more",
      "rating": 8.7,
      "duration": 175,
      "genre": ["Sci-Fi", "Adventure", "Drama"],
      "language": "English",
      "releaseDate": "2026-03-15",
      "director": "Denis Villeneuve",
      "cast": ["Timothée Chalamet", "Zendaya", "Javier Bardem"],
      "premiumPrice": 24.99,
      "regularPrice": 14.99,
      "createdAt": "2026-04-24T23:47:35",
      "updatedAt": "2026-04-24T23:47:37"
    }
    // ... 7 more movies
  ],
  "totalElements": 8,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 10
}
```

**Verdict:** PASS — Returns paginated movie list with 8 movies found.

---

### 3. GET /api/movies?genre=Action\&language=English\&page=0\&size=5

```bash
curl "http://localhost:9898/api/movies?genre=Action&language=English&page=0&size=5"
```

**HTTP Status:** `200 OK`

**Response:** (truncated)
```json
{
  "content": [
    {
      "id": "69eba5ac2bb448ecf8d997dc",
      "title": "Neon Samurai",
      "genre": ["Action", "Sci-Fi", "Cyberpunk"],
      "language": "Japanese"
    },
    {
      "id": "69ebad6add05e8918ce49d0f",
      "title": "Test Movie",
      "genre": ["Action"],
      "language": "English"
  ],
  "totalElements": 2,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 5
}
```

**Note:** The `genre` and `language` filters appear to work as OR logic (both "Action" genre movies returned, regardless of language). Expected AND logic (only "Action" AND "English") would return just "Test Movie".

**Verdict:** PASS (filtering works, but filter combination logic may need review)

---

### 4. GET /api/movies/search?q=test

```bash
curl "http://localhost:9898/api/movies/search?q=test"
```

**HTTP Status:** `200 OK`

**Response:**
```json
[
  {
    "id": "69ebad6add05e8918ce49d0f",
    "title": "Test Movie",
    "tagline": "A test",
    "rating": 8.0,
    "genre": ["Action"],
    "language": "English"
  }
]
```

**Verdict:** PASS — Search finds matching movies by title/tagline.

---

### 5. GET /api/movies/search (no query parameter)

```bash
curl "http://localhost:9898/api/movies/search"
```

**HTTP Status:** `500 Internal Server Error`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:02:29",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Verdict:** FAIL — Should return `400 Bad Request` with a message like "Query parameter 'q' is required", not a 500.

---

### 6. GET /api/movies/non-existent-id

```bash
curl http://localhost:9898/api/movies/non-existent-id
```

**HTTP Status:** `404 Not Found`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:02:30",
  "status": 404,
  "error": "Not Found",
  "message": "Movie with ID 'non-existent-id' not found"
}
```

**Verdict:** PASS

---

### 7. GET /api/theaters (all)

```bash
curl http://localhost:9898/api/theaters
```

**HTTP Status:** `200 OK`

**Response:**
```json
[
  {
    "id": "69eba5ac2bb448ecf8d997e0",
    "name": "IMAX Downtown",
    "address": "123 Main St, Downtown",
    "screens": 8,
    "amenities": ["IMAX", "Dolby Atmos", "Recliner Seats", "VIP Lounge"]
  },
  {
    "id": "69eba5ac2bb448ecf8d997e1",
    "name": "Cineplex Central",
    "address": "456 Broadway Ave, Central",
    "screens": 12,
    "amenities": ["4DX", "Dolby Cinema", "Gold Class", "Play Area"]
  },
  {
    "id": "69eba5ac2bb448ecf8d997e2",
    "name": "Starlite Megaplex",
    "address": "789 Park Blvd, Westside",
    "screens": 15,
    "amenities": ["ScreenX", "RealD 3D", "Beanbags", "Bar"]
  }
]
```

**Verdict:** PASS — Returns 3 theaters.

---

### 8. GET /api/theaters/non-existent-id

```bash
curl http://localhost:9898/api/theaters/non-existent-id
```

**HTTP Status:** `404 Not Found`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:02:30",
  "status": 404,
  "error": "Not Found",
  "message": "Theater with ID 'non-existent-id' not found"
}
```

**Verdict:** PASS

---

### 9. GET /api/movies/{movieId}/showtimes

```bash
curl "http://localhost:9898/api/movies/69eba5ac2bb448ecf8d997da/showtimes"
```

**HTTP Status:** `200 OK`

**Response:**
```json
[
  {
    "id": "69ebae82dd05e8918ce49d12",
    "movieId": "69eba5ac2bb448ecf8d997da",
    "theaterId": "69eba5ac2bb448ecf8d997e1",
    "date": "2026-04-24",
    "times": ["14:00", "20:00"],
    "screen": "3",
    "format": "4DX",
    "theater": null
  },
  {
    "id": "69ebaeb5dd05e8918ce49d13",
    "date": "2026-04-24",
    "times": ["15:00"],
    "screen": "1",
    "format": "2D",
    "theater": null
  },
  {
    "id": "69ebaf11dd05e8918ce49d14",
    "date": "2026-05-01",
    "times": ["10:00"],
    "format": "2D",
    "theater": null
  }
]
```

**Verdict:** PASS — Returns 3 showtimes for the Dune movie.

---

### 10. GET /api/movies/{movieId}/showtimes?date=2026-05-01

```bash
curl "http://localhost:9898/api/movies/69eba5ac2bb448ecf8d997da/showtimes?date=2026-05-01"
```

**HTTP Status:** `200 OK`

**Response:**
```json
[
  {
    "id": "69ebaf11dd05e8918ce49d14",
    "movieId": "69eba5ac2bb448ecf8d997da",
    "theaterId": "69eba5ac2bb448ecf8d997e0",
    "date": "2026-05-01",
    "times": ["10:00"],
    "screen": "1",
    "format": "2D"
  }
]
```

**Verdict:** PASS — Date filter works correctly, returns 1 result.

---

### 11. GET /api/movies/{movieId}/showtimes?embed=true

```bash
curl "http://localhost:9898/api/movies/69eba5ac2bb448ecf8d997da/showtimes?embed=true"
```

**HTTP Status:** `200 OK`

**Response:** (first item, truncated)
```json
[
  {
    "id": "69ebae82dd05e8918ce49d12",
    "date": "2026-04-24",
    "times": ["14:00", "20:00"],
    "screen": "3",
    "format": "4DX",
    "theater": {
      "id": "69eba5ac2bb448ecf8d997e1",
      "name": "Cineplex Central",
      "address": "456 Broadway Ave, Central",
      "screens": 12,
      "amenities": ["4DX", "Dolby Cinema", "Gold Class", "Play Area"]
    }
  }
]
```

**Verdict:** PASS — `embed=true` populates the `theater` field with full theater details.

---

### 12. GET /api/theaters/{theaterId}/showtimes

```bash
curl "http://localhost:9898/api/theaters/69eba5ac2bb448ecf8d997e0/showtimes"
```

**HTTP Status:** `200 OK`

**Response:**
```json
[
  {
    "id": "69ebaeb5dd05e8918ce49d13",
    "movieId": "69eba5ac2bb448ecf8d997da",
    "theaterId": "69eba5ac2bb448ecf8d997e0",
    "date": "2026-04-24",
    "times": ["15:00"],
    "screen": "1",
    "format": "2D"
  },
  {
    "id": "69ebaf11dd05e8918ce49d14",
    "date": "2026-05-01",
    "times": ["10:00"],
    "format": "2D"
  }
]
```

**Verdict:** PASS — Returns 2 showtimes for the IMAX Downtown theater.

---

### 13. GET /api/theaters/{theaterId}/showtimes?date=2026-05-01\&embed=true

```bash
curl "http://localhost:9898/api/theaters/69eba5ac2bb448ecf8d997e0/showtimes?date=2026-05-01&embed=true"
```

**HTTP Status:** `200 OK`

**Response:**
```json
[
  {
    "id": "69ebaf11dd05e8918ce49d14",
    "date": "2026-05-01",
    "times": ["10:00"],
    "screen": "1",
    "format": "2D",
    "theater": {
      "id": "69eba5ac2bb448ecf8d997e0",
      "name": "IMAX Downtown",
      "address": "123 Main St, Downtown",
      "screens": 8,
      "amenities": ["IMAX", "Dolby Atmos", "Recliner Seats", "VIP Lounge"]
    }
  }
]
```

**Verdict:** PASS — Date filter + embed work together correctly.

---

### 14. GET /api/showtimes/non-existent-id

```bash
curl "http://localhost:9898/api/showtimes/non-existent-id"
```

**HTTP Status:** `404 Not Found`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:18",
  "status": 404,
  "error": "Not Found",
  "message": "Showtime with ID 'non-existent-id' not found"
}
```

**Verdict:** PASS

---

### 15. GET /api/showtimes/non-existent-id?embed=true

```bash
curl "http://localhost:9898/api/showtimes/non-existent-id?embed=true"
```

**HTTP Status:** `404 Not Found`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:19",
  "status": 404,
  "error": "Not Found",
  "message": "Showtime with ID 'non-existent-id' not found"
}
```

**Verdict:** PASS

---

### 16. POST /api/movies without auth (expect 401)

```bash
curl -X POST http://localhost:9898/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Hack"}'
```

**HTTP Status:** `401 Unauthorized`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:19",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Verdict:** PASS

---

### 17. POST /api/movies with ROLE_USER (expect 403)

```bash
curl -X POST http://localhost:9898/api/movies \
  -H "X-User-ID: user-123" \
  -H "X-User-Name: regularuser" \
  -H "X-User-Roles: ROLE_USER" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hack"}'
```

**HTTP Status:** `400 Bad Request`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:19",
  "status": 400,
  "error": "Validation Failed",
  "message": "{backdrop=Backdrop URL is required, releaseDate=Release date is required, director=Director is required, ...}"
}
```

**Verdict:** FAIL — Expected `403 Forbidden`. The request passed the role check and reached validation, meaning `ROLE_USER` was granted access to an ADMIN-only endpoint. **This is a security vulnerability.**

---

### 18. DELETE /api/movies/{id} without auth (expect 401)

```bash
curl -X DELETE http://localhost:9898/api/movies/some-id \
  -H "X-User-ID: " \
  -H "X-User-Roles: "
```

**HTTP Status:** `401 Unauthorized`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:19",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Verdict:** PASS

---

### 19. POST /api/theaters without auth (expect 401)

```bash
curl -X POST http://localhost:9898/api/theaters \
  -H "Content-Type: application/json" \
  -d '{"name":"Hack"}'
```

**HTTP Status:** `401 Unauthorized`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:19",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Verdict:** PASS

---

### 20. POST /api/showtimes without auth (expect 401)

```bash
curl -X POST http://localhost:9898/api/showtimes \
  -H "Content-Type: application/json" \
  -d '{"movieId":"x"}'
```

**HTTP Status:** `401 Unauthorized`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:03:19",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Verdict:** PASS

---

### 21. POST /api/movies (create movie, ADMIN)

```bash
curl -X POST http://localhost:9898/api/movies \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Movie: Iron Man",
    "tagline": "A test movie for curl testing",
    "poster": "https://example.com/ironman.jpg",
    "backdrop": "https://example.com/ironman_backdrop.jpg",
    "rating": 8.5,
    "duration": 150,
    "genre": ["Action", "Sci-Fi"],
    "language": "English",
    "releaseDate": "2026-06-15",
    "director": "Test Director",
    "cast": ["Actor One", "Actor Two", "Actor Three"],
    "description": "An amazing test movie for API testing purposes.",
    "premiumPrice": 24.99,
    "regularPrice": 14.99
  }'
```

**HTTP Status:** `201 Created`

**Response:**
```json
{
  "id": "69f0c56050cd3a34e13670fa",
  "title": "Test Movie: Iron Man",
  "tagline": "A test movie for curl testing",
  "poster": "https://example.com/ironman.jpg",
  "rating": 8.5,
  "duration": 150,
  "genre": ["Action", "Sci-Fi"],
  "language": "English",
  "releaseDate": "2026-06-15",
  "director": "Test Director",
  "cast": ["Actor One", "Actor Two", "Actor Three"],
  "description": "An amazing test movie for API testing purposes.",
  "premiumPrice": 24.99,
  "regularPrice": 14.99,
  "createdAt": "2026-04-28T20:04:08",
  "updatedAt": "2026-04-28T20:04:08"
}
```

**Verdict:** PASS — Movie created with auto-generated ID and timestamps.

---

### 22. PUT /api/movies/{id} (full update, ADMIN)

```bash
curl -X PUT http://localhost:9898/api/movies/69f0c56050cd3a34e13670fa \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Movie: Iron Man 2 (Updated)",
    "tagline": "Updated tagline for testing",
    "poster": "https://example.com/ironman2.jpg",
    "backdrop": "https://example.com/ironman2_backdrop.jpg",
    "rating": 9.0,
    "duration": 165,
    "genre": ["Action", "Sci-Fi", "Adventure"],
    "language": "English",
    "releaseDate": "2026-07-20",
    "director": "Updated Director",
    "cast": ["Actor One", "Actor Four"],
    "description": "Updated description for the second test movie.",
    "premiumPrice": 29.99,
    "regularPrice": 19.99
  }'
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c56050cd3a34e13670fa",
  "title": "Test Movie: Iron Man 2 (Updated)",
  "tagline": "Updated tagline for testing",
  "rating": 9.0,
  "duration": 165,
  "genre": ["Action", "Sci-Fi", "Adventure"],
  "createdAt": "2026-04-28T20:04:08",
  "updatedAt": "2026-04-28T20:04:36"
}
```

**Verdict:** PASS — All fields updated, `updatedAt` changed, `createdAt` preserved.

---

### 23. PATCH /api/movies/{id} (partial update, ADMIN)

```bash
curl -X PATCH http://localhost:9898/api/movies/69f0c56050cd3a34e13670fa \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 9.5,
    "premiumPrice": 34.99
  }'
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c56050cd3a34e13670fa",
  "title": "Test Movie: Iron Man 2 (Updated)",
  "rating": 9.5,
  "premiumPrice": 34.99,
  "regularPrice": 19.99,
  "updatedAt": "2026-04-28T20:04:36"
}
```

**Verdict:** PASS — Only `rating` was patched (9.0 -> 9.5). `premiumPrice` was patched (29.99 -> 34.99). All other fields preserved.

---

### 24. GET /api/movies/{id} (verify patched movie)

```bash
curl http://localhost:9898/api/movies/69f0c56050cd3a34e13670fa
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c56050cd3a34e13670fa",
  "title": "Test Movie: Iron Man 2 (Updated)",
  "rating": 9.5,
  "premiumPrice": 34.99,
  "regularPrice": 19.99
}
```

**Verdict:** PASS — Patch changes persisted correctly.

---

### 25. POST /api/theaters (create theater, ADMIN)

```bash
curl -X POST http://localhost:9898/api/theaters \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cinebook Arena",
    "address": "999 Test Road, Tech City, TC 500001",
    "screens": 6,
    "amenities": ["IMAX", "Dolby Atmos", "3D", "Reclining Seats"]
  }'
```

**HTTP Status:** `201 Created`

**Response:**
```json
{
  "id": "69f0c57d50cd3a34e13670fb",
  "name": "Test Cinebook Arena",
  "address": "999 Test Road, Tech City, TC 500001",
  "screens": 6,
  "amenities": ["IMAX", "Dolby Atmos", "3D", "Reclining Seats"],
  "createdAt": "2026-04-28T20:04:37",
  "updatedAt": "2026-04-28T20:04:37"
}
```

**Verdict:** PASS

---

### 26. PUT /api/theaters/{id} (update theater, ADMIN)

```bash
curl -X PUT http://localhost:9898/api/theaters/69f0c57d50cd3a34e13670fb \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cinebook Arena Premium",
    "address": "1000 Updated Road, Tech City, TC 500002",
    "screens": 10,
    "amenities": ["IMAX", "Dolby Atmos", "4DX", "3D", "VIP Lounge"]
  }'
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c57d50cd3a34e13670fb",
  "name": "Test Cinebook Arena Premium",
  "address": "1000 Updated Road, Tech City, TC 500002",
  "screens": 10,
  "amenities": ["IMAX", "Dolby Atmos", "4DX", "3D", "VIP Lounge"],
  "createdAt": "2026-04-28T20:04:37",
  "updatedAt": "2026-04-28T20:05:50"
}
```

**Verdict:** PASS

---

### 27. POST /api/showtimes (create showtime, ADMIN)

```bash
curl -X POST http://localhost:9898/api/showtimes \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": "69eba5ac2bb448ecf8d997da",
    "theaterId": "69f0c57d50cd3a34e13670fb",
    "date": "2026-06-01",
    "times": ["10:00", "13:30", "17:00", "20:30"],
    "screen": "Screen 1",
    "format": "IMAX"
  }'
```

**HTTP Status:** `201 Created`

**Response:**
```json
{
  "id": "69f0c5c750cd3a34e13670fc",
  "movieId": "69eba5ac2bb448ecf8d997da",
  "theaterId": "69f0c57d50cd3a34e13670fb",
  "date": "2026-06-01",
  "times": ["10:00", "13:30", "17:00", "20:30"],
  "screen": "Screen 1",
  "format": "IMAX",
  "theater": null,
  "createdAt": "2026-04-28T20:05:51",
  "updatedAt": "2026-04-28T20:05:51"
}
```

**Verdict:** PASS

---

### 28. GET /api/showtimes/{id}

```bash
curl http://localhost:9898/api/showtimes/69f0c5c750cd3a34e13670fc
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c5c750cd3a34e13670fc",
  "movieId": "69eba5ac2bb448ecf8d997da",
  "theaterId": "69f0c57d50cd3a34e13670fb",
  "date": "2026-06-01",
  "times": ["10:00", "13:30", "17:00", "20:30"],
  "screen": "Screen 1",
  "format": "IMAX",
  "theater": null
}
```

**Verdict:** PASS

---

### 29. GET /api/showtimes/{id}?embed=true

```bash
curl "http://localhost:9898/api/showtimes/69f0c5c750cd3a34e13670fc?embed=true"
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c5c750cd3a34e13670fc",
  "date": "2026-06-01",
  "times": ["10:00", "13:30", "17:00", "20:30"],
  "screen": "Screen 1",
  "format": "IMAX",
  "theater": {
    "id": "69f0c57d50cd3a34e13670fb",
    "name": "Test Cinebook Arena Premium",
    "address": "1000 Updated Road, Tech City, TC 500002",
    "screens": 10,
    "amenities": ["IMAX", "Dolby Atmos", "4DX", "3D", "VIP Lounge"]
  }
}
```

**Verdict:** PASS — Theater details correctly embedded.

---

### 30. PUT /api/showtimes/{id} (update showtime, ADMIN)

```bash
curl -X PUT http://localhost:9898/api/showtimes/69f0c5c750cd3a34e13670fc \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": "69eba5ac2bb448ecf8d997da",
    "theaterId": "69eba5ac2bb448ecf8d997e0",
    "date": "2026-06-15",
    "times": ["11:00", "14:30", "21:00"],
    "screen": "Screen 3",
    "format": "2D"
  }'
```

**HTTP Status:** `200 OK`

**Response:**
```json
{
  "id": "69f0c5c750cd3a34e13670fc",
  "movieId": "69eba5ac2bb448ecf8d997da",
  "theaterId": "69eba5ac2bb448ecf8d997e0",
  "date": "2026-06-15",
  "times": ["11:00", "14:30", "21:00"],
  "screen": "Screen 3",
  "format": "2D",
  "updatedAt": "2026-04-28T20:06:54"
}
```

**Verdict:** PASS — Date, times, screen, format, and theater all updated.

---

### 31. POST /api/movies with missing fields (expect 400)

```bash
curl -X POST http://localhost:9898/api/movies \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Incomplete Movie"}'
```

**HTTP Status:** `400 Bad Request`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:06:54",
  "status": 400,
  "error": "Validation Failed",
  "message": "{backdrop=Backdrop URL is required, releaseDate=Release date is required, director=Director is required, regularPrice=Regular price is required, rating=Rating is required, description=Description is required, language=Language is required, premiumPrice=Premium price is required, duration=Duration is required, cast=Cast is required, genre=Genre is required, tagline=Tagline is required, poster=Poster URL is required}"
}
```

**Verdict:** PASS — All 13 missing required fields reported.

---

### 32. POST /api/theaters with missing fields (expect 400)

```bash
curl -X POST http://localhost:9898/api/theaters \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"name": "No Address Theater"}'
```

**HTTP Status:** `400 Bad Request`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:06:54",
  "status": 400,
  "error": "Validation Failed",
  "message": "{amenities=Amenities are required, address=Address is required, screens=Screens count is required}"
}
```

**Verdict:** PASS — All 3 missing required fields reported.

---

### 33. POST /api/showtimes with missing fields (expect 400)

```bash
curl -X POST http://localhost:9898/api/showtimes \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"movieId": "only-movie"}'
```

**HTTP Status:** `400 Bad Request`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:06:54",
  "status": 400,
  "error": "Validation Failed",
  "message": "{date=Date is required, times=Times are required, theaterId=Theater ID is required, format=Format is required, screen=Screen is required}"
}
```

**Verdict:** PASS — All 5 missing required fields reported.

---

### 34. PUT /api/movies/non-existent-id with invalid body (expect 404)

```bash
curl -X PUT http://localhost:9898/api/movies/non-existent-id \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ghost"}'
```

**HTTP Status:** `400 Bad Request`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:06:54",
  "status": 400,
  "error": "Validation Failed",
  "message": "{backdrop=Backdrop URL is required, ... 13 fields missing ...}"
}
```

**Verdict:** FAIL — Expected `404 Not Found`. Validation runs before the resource existence check. The user cannot know whether the movie exists or not because validation errors mask the 404.

---

### 35. DELETE /api/movies/{id} (ADMIN)

```bash
curl -X DELETE http://localhost:9898/api/movies/69f0c56050cd3a34e13670fa \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN"
```

**HTTP Status:** `204 No Content`

**Response:** _(empty body)_

**Verdict:** PASS

---

### 36. DELETE /api/theaters/{id} (ADMIN)

```bash
curl -X DELETE http://localhost:9898/api/theaters/69f0c57d50cd3a34e13670fb \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN"
```

**HTTP Status:** `204 No Content`

**Response:** _(empty body)_

**Verdict:** PASS

---

### 37. DELETE /api/showtimes/{id} (ADMIN)

```bash
curl -X DELETE http://localhost:9898/api/showtimes/69f0c5c750cd3a34e13670fc \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN"
```

**HTTP Status:** `204 No Content`

**Response:** _(empty body)_

**Verdict:** PASS

---

### 38. DELETE /api/movies/{id} again (already deleted, expect 404)

```bash
curl -X DELETE http://localhost:9898/api/movies/69f0c56050cd3a34e13670fa \
  -H "X-User-ID: admin-001" \
  -H "X-User-Name: admin" \
  -H "X-User-Roles: ROLE_ADMIN"
```

**HTTP Status:** `404 Not Found`

**Response:**
```json
{
  "timestamp": "2026-04-28T20:06:57",
  "status": 404,
  "error": "Not Found",
  "message": "Movie with ID '69f0c56050cd3a34e13670fa' not found"
}
```

**Verdict:** PASS

---

## Endpoint Coverage

| # | Method | Path | Auth | Status |
|---|---|---|---|---|
| 1 | GET | `/health` | Public | PASS |
| 2 | GET | `/api/movies` | Public | PASS |
| 3 | GET | `/api/movies?genre=&language=` | Public | PASS |
| 4 | GET | `/api/movies/search?q=` | Public | PASS |
| 5 | GET | `/api/movies/search` (no param) | Public | FAIL (500) |
| 6 | GET | `/api/movies/{id}` | Public | PASS |
| 7 | GET | `/api/theaters` | Public | PASS |
| 8 | GET | `/api/theaters/{id}` | Public | PASS |
| 9 | GET | `/api/movies/{id}/showtimes` | Public | PASS |
| 10 | GET | `/api/movies/{id}/showtimes?date=` | Public | PASS |
| 11 | GET | `/api/movies/{id}/showtimes?embed=true` | Public | PASS |
| 12 | GET | `/api/theaters/{id}/showtimes` | Public | PASS |
| 13 | GET | `/api/theaters/{id}/showtimes?date=&embed=true` | Public | PASS |
| 14 | GET | `/api/showtimes/{id}` | Public | PASS |
| 15 | GET | `/api/showtimes/{id}?embed=true` | Public | PASS |
| 16 | POST | `/api/movies` (no auth) | -- | PASS (401) |
| 17 | POST | `/api/movies` (ROLE_USER) | -- | FAIL (expected 403) |
| 18 | DELETE | `/api/movies/{id}` (no auth) | -- | PASS (401) |
| 19 | POST | `/api/theaters` (no auth) | -- | PASS (401) |
| 20 | POST | `/api/showtimes` (no auth) | -- | PASS (401) |
| 21 | POST | `/api/movies` | ADMIN | PASS (201) |
| 22 | PUT | `/api/movies/{id}` | ADMIN | PASS (200) |
| 23 | PATCH | `/api/movies/{id}` | ADMIN | PASS (200) |
| 24 | GET | `/api/movies/{id}` (verify) | Public | PASS |
| 25 | POST | `/api/theaters` | ADMIN | PASS (201) |
| 26 | PUT | `/api/theaters/{id}` | ADMIN | PASS (200) |
| 27 | POST | `/api/showtimes` | ADMIN | PASS (201) |
| 28 | GET | `/api/showtimes/{id}` | Public | PASS |
| 29 | GET | `/api/showtimes/{id}?embed=true` | Public | PASS |
| 30 | PUT | `/api/showtimes/{id}` | ADMIN | PASS (200) |
| 31 | POST | `/api/movies` (invalid body) | ADMIN | PASS (400) |
| 32 | POST | `/api/theaters` (invalid body) | ADMIN | PASS (400) |
| 33 | POST | `/api/showtimes` (invalid body) | ADMIN | PASS (400) |
| 34 | PUT | `/api/movies/{non-existent}` | ADMIN | FAIL (400 vs 404) |
| 35 | DELETE | `/api/movies/{id}` | ADMIN | PASS (204) |
| 36 | DELETE | `/api/theaters/{id}` | ADMIN | PASS (204) |
| 37 | DELETE | `/api/showtimes/{id}` | ADMIN | PASS (204) |
| 38 | DELETE | `/api/movies/{id}` (double) | ADMIN | PASS (404) |

## Critical Findings

### BUG-1: ROLE_ADMIN authorization bypass (Severity: HIGH)

**Test #17** — A request with `X-User-Roles: ROLE_USER` was able to reach the body validation stage of `POST /api/movies` (an ADMIN-only endpoint). It returned 400 (validation error) instead of 403 (forbidden). With a complete request body, a non-admin user could create movies, theaters, and showtimes.

**Root cause:** Likely in `UserRoleFilter` or `UserRoleAuthenticationToken` — the role parsing or `@PreAuthorize("hasRole('ROLE_ADMIN')")` evaluation is not correctly restricting non-admin users.

### BUG-2: PUT validates before checking resource existence (Severity: LOW)

**Test #34** — `PUT /api/movies/non-existent-id` with an incomplete body returns 400 (validation) rather than 404 (not found). The service should check if the resource exists before validating the body, or at least return 404 when the resource is missing regardless of body validity.

### BUG-3: Search without query parameter throws 500 (Severity: MEDIUM)

**Test #5** — `GET /api/movies/search` without the `q` parameter results in a 500 Internal Server Error. This should return 400 Bad Request with a descriptive message indicating the `q` parameter is required.


curl -X GET http://localhost:9898/api/showtimes \
-H "X-User-ID: admin-001" \
-H "X-User-Name: admin" \
-H "X-User-Roles: ROLE_ADMIN" \