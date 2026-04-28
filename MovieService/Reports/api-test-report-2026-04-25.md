# MovieService API Test Report
**Date:** 2026-04-25
**Server:** `http://localhost:9898`
**Database:** MongoDB (Railway — `shortline.proxy.rlwy.net:13833`)
**Spring Boot:** 4.0.6

---

## Summary

**Total Tests:** 42 | **Passed:** 27 | **Failed:** 15 | **Pass Rate:** 64.3%

---

## Movies (GET — Public)

| # | Test | Status | Response |
|---|------|--------|----------|
| 1 | `GET /api/movies` | PASS | 200 — 8 movies, paginated correctly |
| 2 | `GET /api/movies/{id}` | PASS | 200 — Full movie object returned |
| 3 | `GET /api/movies/{id}` (non-existent) | PASS | 404 — "Movie with ID 'nonexistent' not found" |
| 4 | `GET /api/movies/search?q=dune` | PASS | 200 — Returned 1 matching movie |
| 5 | `GET /api/movies/search?q=nonexistentxyz` | PASS | 200 — Empty array `[]` |
| 6 | `GET /api/movies?page=0&size=3` | PASS | 200 — Pagination works |
| 7 | `GET /api/movies?genre=Sci-Fi` | PASS | 200 — 3 Sci-Fi movies returned |
| 8 | `GET /api/movies?sort=rating&sortDir=desc&size=20` | PASS | 200 — `[9.1, 8.7, 8.3, 8.1, 8.0, 7.9, 7.6, 7.5]` |
| 9 | `GET /api/movies?sort=rating&sortDir=asc&size=20` | PASS | 200 — `[7.5, 7.6, 7.9, 8.0, 8.1, 8.3, 8.7, 9.1]` |

## Movies (POST/PUT/PATCH/DELETE — Admin)

| # | Test | Status | Response |
|---|------|--------|----------|
| 10 | `POST /api/movies` (with admin auth) | **FAIL** | 403 — Expected 201. `X-User-Roles: ADMIN` not recognized by `hasRole('ADMIN')` |
| 11 | `PUT /api/movies/{id}` (full update) | **FAIL** | 500 — Cascading: no ID from T10 |
| 12 | `PATCH /api/movies/{id}` (partial) | **FAIL** | 500 — Cascading: no ID from T10 |
| 13 | `POST /api/movies` (no auth) | PASS | 403 — Forbidden |
| 14 | `POST /api/movies` (missing required fields) | PASS | 400 — Lists all missing fields |
| 15 | `POST /api/movies` (rating=15, out of range) | **FAIL** | 403 — Expected 400. Auth blocked before validation |
| 16 | `POST /api/movies` (invalid poster URL) | **FAIL** | 403 — Expected 400. Auth blocked before validation |
| 17 | `DELETE /api/movies/{id}` (no auth) | PASS | 403 — Forbidden |

## Theaters

| # | Test | Status | Response |
|---|------|--------|----------|
| 18 | `GET /api/theaters` | PASS | 200 — 3 theaters returned |
| 19 | `GET /api/theaters/{id}` | PASS | 200 — Full theater object |
| 20 | `GET /api/theaters/nonexistent` | PASS | 404 — "Theater with ID 'nonexistent' not found" |
| 21 | `POST /api/theaters` (admin) | **FAIL** | 403 — Expected 201. Same auth issue as movies |
| 22 | `PUT /api/theaters/{id}` (admin) | **FAIL** | 500 — Cascading: no ID from T21 |
| 23 | `DELETE /api/theaters/{id}` (admin) | **FAIL** | 500 — Cascading: no ID from T21 |
| 24 | `POST /api/theaters` (no auth) | PASS | 403 — Forbidden |

## Showtimes

| # | Test | Status | Response |
|---|------|--------|----------|
| 25 | `POST /api/showtimes` (admin) | **FAIL** | 400 — DTO field mismatch: sends `time`/`screenNumber`/`remainingSeats`, expects `times`/`screen`/`format` |
| 26 | `GET /api/movies/{id}/showtimes` | PASS | 200 — 3 showtimes returned (pre-existing) |
| 27 | `GET /api/movies/{id}/showtimes?date=2026-05-01` | PASS | 200 — Date filtering works |
| 28 | `GET /api/theaters/{id}/showtimes` | PASS | 200 — Theater's showtimes |
| 29 | `GET /api/showtimes/{id}` | **FAIL** | 403 — Cascading: no ID from T25, hit `/api/showtimes/` (empty path) |
| 30 | `GET /api/showtimes/{id}` (non-existent) | PASS | 404 — "Showtime with ID 'nonexistent' not found" |
| 31 | `GET /api/movies/{id}/showtimes?embed=true` | PASS | 200 — Theater data embedded |
| 32 | `PUT /api/showtimes/{id}` (admin) | **FAIL** | 500 — Cascading: no ID from T25 |
| 33 | `DELETE /api/showtimes/{id}` (admin) | **FAIL** | 500 — Cascading: no ID from T25 |
| 34 | `DELETE /api/showtimes/{id}` (no auth) | PASS | 403 — Forbidden |
| 35 | `POST /api/showtimes` (duplicate) | **FAIL** | 400 — Expected 409. Same DTO field mismatch as T25 |
| 36 | `POST /api/showtimes` (invalid movieId) | **FAIL** | 400 — Expected 422. Same DTO field mismatch masks the movieId check |
| 37 | `POST /api/showtimes` (invalid theaterId) | **FAIL** | 400 — Expected 422. Same DTO field mismatch masks the theaterId check |
| 38 | `POST /api/showtimes` (invalid time "25:00") | PASS | 400 — Validation error |
| 39 | `POST /api/showtimes` (invalid date "not-a-date") | PASS | 400 — Validation error |
| 40 | `POST /api/showtimes` (no auth) | PASS | 403 — Forbidden |

## Miscellaneous

| # | Test | Status | Response |
|---|------|--------|----------|
| 41 | `GET /health` | PASS | 200 — `{"status":"UP"}` |
| 42 | Error response format | PASS | Contains timestamp, status, error, message |

---

## Failed Tests — Root Causes

### Root Cause 1: `hasRole('ADMIN')` mismatch (10 of 15 failures)

**Affected tests:** T10, T11, T12, T15, T16, T21, T22, T23, T32, T33

**Why:** `UserRoleFilter.parseRoles()` creates `SimpleGrantedAuthority("ADMIN")` from the header `X-User-Roles: ADMIN`. Spring Security's `hasRole('ADMIN')` internally appends `ROLE_` prefix, looking for `ROLE_ADMIN`. The authority `"ADMIN"` never matches `"ROLE_ADMIN"`, so every `@PreAuthorize("hasRole('ADMIN')")` check denies access.

**Verified:** Sending `X-User-Roles: ROLE_ADMIN` instead of `ADMIN` returns 201 correctly.

**Fix options:**
- Option A: Prefix roles with `ROLE_` in `parseRoles()`: `.map(r -> new SimpleGrantedAuthority("ROLE_" + r))`
- Option B: Change `@PreAuthorize` from `hasRole('ADMIN')` to `hasAuthority('ADMIN')`

---

### Root Cause 2: ShowtimeRequestDTO field name mismatch (5 of 15 failures)

**Affected tests:** T25, T35, T36, T37

**Why:** The test script sends field names `time` (String), `screenNumber` (int), `remainingSeats` (int) but `ShowtimeRequestDTO` defines `times` (List\<String\>), `screen` (String), `format` (String). The DTO fields are null/blank on arrival, triggering `@NotBlank`/`@NotNull` validation errors (400) instead of reaching business logic.

**Note:** Even if the fields matched, T25 would still be affected by Root Cause 1 (auth 403) since Spring evaluates `@Valid` before `@PreAuthorize` in some cases — the auth passes (any authenticated user), validation fails with 400.

---

### Root Cause 3: Cascading failures (5 of 15 failures)

**Affected tests:** T11, T12, T22, T23, T29, T32, T33

**Why:** These tests depend on IDs created by earlier admin-auth tests (T10, T21, T25). When those fail, subsequent tests operate on empty/null IDs, causing HTTP 500 errors or hitting wrong URL paths.

---

## Public Endpoints Status

All public (unauthenticated) GET endpoints work correctly:
- Movie CRUD reads: sorting, filtering, pagination, search — all functional
- Theater CRUD reads — all functional
- Showtime reads with embed pattern — all functional
- Health check — functional
- Error response format — correct

---

## HTTP Status Codes Verified

| Code | Endpoints Tested | Result |
|------|-----------------|--------|
| 200 | GET (all public) | PASS |
| 201 | POST (movies, theaters) | **FAIL** — auth returns 403 |
| 204 | DELETE (theaters, showtimes) | **FAIL** — auth returns 403 |
| 400 | Validation errors (movies) | PASS |
| 403 | Unauthenticated admin endpoints | PASS |
| 404 | Non-existent resources | PASS |
| 409 | Duplicate showtime | **FAIL** — returns 400 (field mismatch) |
| 422 | Invalid movieId/theaterId | **FAIL** — returns 400 (field mismatch masks referential check) |

---

## Known Issues (Carried Forward)

| Issue | Severity | Status |
|-------|----------|--------|
| `hasRole('ADMIN')` doesn't match authority `ADMIN` | **High** | Open — breaks all admin endpoints |
| ShowtimeRequestDTO field names don't match test expectations | Medium | Open — `times`/`screen`/`format` vs `time`/`screenNumber`/`remainingSeats` |
| `createdAt` is null for seed data | Low | Fixed for new inserts — backfill runs on startup |
| MongoDB indexes not created (Railway disk space) | Low | Non-fatal — API works, queries just slower |
