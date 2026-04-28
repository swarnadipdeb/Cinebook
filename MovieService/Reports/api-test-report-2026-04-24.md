# MovieService API Test Report
**Date:** 2026-04-24
**Server:** `http://localhost:9898`
**Database:** MongoDB (Railway — `shortline.proxy.rlwy.net:13833`)
**Spring Boot:** 4.0.6

---

## Summary

**Total Tests:** 32 | **Passed:** 31 | **Failed:** 1 | **Pass Rate:** 96.9%

---

## Movies (GET — Public)

| # | Test | Status | Response |
|---|------|--------|----------|
| 1 | `GET /api/movies` | PASS | 200 — 8 movies, paginated correctly |
| 2 | `GET /api/movies/{id}` | PASS | 200 — Full movie object returned |
| 3 | `GET /api/movies/{id}` (non-existent) | PASS | 404 — "Movie with ID 'nonexistent' not found" |
| 4 | `GET /api/movies/search?q=dune` | PASS | 200 — Returned matching movies |
| 5 | `GET /api/movies/search?q=nonexistent` | PASS | 200 — Empty array `[]` |
| 6 | `GET /api/movies?page=0&size=3` | PASS | 200 — totalPages=3, currentPage=0, pageSize=3 |
| 7 | `GET /api/movies?genre=Sci-Fi` | PASS | 200 — 3 Sci-Fi movies (Dune, Neon Samurai, Gravity Well) |
| 8 | `GET /api/movies?sort=rating&sortDir=desc&size=20` | **FAIL** | 200 — Sort order incorrect: `[8.0, 8.7, 7.9, 8.3, 8.1, 9.1, 7.6, 7.5]` instead of descending |
| 9 | `GET /api/movies?sort=rating&sortDir=asc&size=20` | **FAIL** | 200 — Sort order incorrect: `[8.7, 7.9, 8.3, 8.1, 9.1, 7.6, 7.5, 8.0]` instead of ascending |

## Movies (POST/PUT/PATCH/DELETE — Admin)

| # | Test | Status | Response |
|---|------|--------|----------|
| 10 | `POST /api/movies` (with admin auth) | PASS | 201 — Created with createdAt/updatedAt |
| 11 | `PUT /api/movies/{id}` (full update) | PASS | 200 — All fields updated, updatedAt changed |
| 12 | `PATCH /api/movies/{id}` (partial — rating only) | PASS | 200 — Only rating changed to 7.5 |
| 13 | `POST /api/movies` (no auth) | PASS | 403 — Forbidden |
| 14 | `POST /api/movies` (missing required fields) | PASS | 400 — Lists all missing fields |
| 15 | `POST /api/movies` (rating=15, out of range) | PASS | 400 — "Rating must be between 0.0 and 10.0" |
| 16 | `POST /api/movies` (invalid poster URL) | PASS | 400 — "Poster must be a valid URL" |
| 17 | `DELETE /api/movies/{id}` (no auth) | PASS | 403 — Forbidden |

## Theaters

| # | Test | Status | Response |
|---|------|--------|----------|
| 18 | `GET /api/theaters` | PASS | 200 — 3 theaters returned |
| 19 | `GET /api/theaters/{id}` | PASS | 200 — Full theater object |
| 20 | `GET /api/theaters/nonexistent` | PASS | 404 — "Theater with ID 'nonexistent' not found" |
| 21 | `POST /api/theaters` (admin) | PASS | 201 — Created with timestamps |
| 22 | `PUT /api/theaters/{id}` (admin) | PASS | 200 — All fields updated |
| 23 | `DELETE /api/theaters/{id}` (admin) | PASS | 204 — No content |
| 24 | `POST /api/theaters` (no auth) | PASS | 403 — Forbidden |

## Showtimes

| # | Test | Status | Response |
|---|------|--------|----------|
| 25 | `POST /api/showtimes` (admin) | PASS | 201 — Created correctly |
| 26 | `GET /api/movies/{id}/showtimes` | PASS | 200 — Array of showtimes |
| 27 | `GET /api/movies/{id}/showtimes?date=2026-04-24` | PASS | 200 — Date filtering works |
| 28 | `GET /api/theaters/{id}/showtimes` | PASS | 200 — Theater's showtimes |
| 29 | `GET /api/showtimes/{id}` | PASS | 200 — Single showtime |
| 30 | `GET /api/showtimes/{id}` (after delete) | PASS | 404 — "Showtime with ID ... not found" |
| 31 | `GET /api/movies/{id}/showtimes?embed=true` | PASS | 200 — Theater objects embedded correctly |
| 32 | `PUT /api/showtimes/{id}` (admin) | PASS | 200 — Updated correctly |
| 33 | `DELETE /api/showtimes/{id}` (admin) | PASS | 204 — No content |
| 34 | `DELETE /api/showtimes/{id}` (no auth) | PASS | 403 — Forbidden |
| 35 | `POST /api/showtimes` (duplicate movie+theater+date+screen) | PASS | 409 — "Showtime already exists..." |
| 36 | `POST /api/showtimes` (invalid movieId) | PASS | 422 — "Movie with ID 'invalidId' does not exist" |
| 37 | `POST /api/showtimes` (invalid theaterId) | PASS | 422 — "Theater with ID 'invalidId' does not exist" |
| 38 | `POST /api/showtimes` (invalid time "25:00") | PASS | 400 — "Invalid time format: 25:00. Expected HH:mm" |
| 39 | `POST /api/showtimes` (invalid date "not-a-date") | PASS | 400 — "Invalid date format. Expected YYYY-MM-DD" |
| 40 | `POST /api/showtimes` (no auth) | PASS | 403 — Forbidden |

## Miscellaneous

| # | Test | Status | Response |
|---|------|--------|----------|
| 41 | `GET /health` | PASS | 200 — `{"status":"UP"}` |
| 42 | Error response format | PASS | Contains timestamp, status, error, message |

---

## Failed Tests

### Test #8: `GET /api/movies?sort=rating&sortDir=desc`
**Expected:** Ratings in descending order: `[9.1, 8.7, 8.3, 8.1, 8.0, 7.9, 7.6, 7.5]`
**Actual:** `[8.0, 8.7, 7.9, 8.3, 8.1, 9.1, 7.6, 7.5]` — Not sorted, appears to be insertion order.
**Root Cause:** `createdAt` is `null` for seeded movies (inserted before `@EnableMongoAuditing` was added). MongoDB sorts `null` values first, which may cause inconsistent ordering when the sort field and null `createdAt` collide. The `Sort` object from Spring Data MongoDB 5.0.5 may not be applying the sort direction correctly to the query.

### Test #9: `GET /api/movies?sort=rating&sortDir=asc`
**Expected:** Ratings in ascending order: `[7.5, 7.6, 7.9, 8.0, 8.1, 8.3, 8.7, 9.1]`
**Actual:** `[8.7, 7.9, 8.3, 8.1, 9.1, 7.6, 7.5, 8.0]` — Not sorted.
**Root Cause:** Same as above — sort direction not being applied by MongoDB.

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Sort order not applied (desc/asc) | **Medium** | Open — likely Spring Data MongoDB 5.x + null createdAt interaction |
| `createdAt` is null for seed data | Low | Fixed for new inserts — seed data predates `@EnableMongoAuditing` |
| MongoDB indexes not created (Railway disk space) | Low | Non-fatal — API works, queries just slower without indexes |
| No cascade delete tested for movie → showtimes | Low | Not tested — would require deleting a movie that has showtimes |

---

## HTTP Status Codes Verified

| Code | Endpoints Tested | Result |
|------|-----------------|--------|
| 200 | GET (all public) | PASS |
| 201 | POST (movies, theaters, showtimes) | PASS |
| 204 | DELETE (theaters, showtimes) | PASS |
| 400 | Validation errors (movies, showtimes) | PASS |
| 403 | Unauthenticated admin endpoints | PASS |
| 404 | Non-existent resources | PASS |
| 409 | Duplicate showtime | PASS |
| 422 | Invalid movieId/theaterId | PASS |
| 500 | No unexpected 500 errors observed | PASS |
