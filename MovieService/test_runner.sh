#!/bin/bash

BASE="http://localhost:9898"
PASS=0
FAIL=0
RESULTS=""

log() {
  local num="$1" status="$2" desc="$3" detail="$4"
  RESULTS="${RESULTS}\n| ${num} | ${desc} | ${status} | ${detail} |"
  if [ "$status" = "PASS" ]; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
}

# Get movie ID
MOVIES_JSON=$(curl -s "$BASE/api/movies")
MOVIE_ID=$(echo "$MOVIES_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Movie ID: $MOVIE_ID"

# Get theater ID
THEATERS_JSON=$(curl -s "$BASE/api/theaters")
THEATER_ID=$(echo "$THEATERS_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Theater ID: $THEATER_ID"

# T1
HTTP=$(curl -s -o /tmp/r1.json -w "%{http_code}" "$BASE/api/movies?page=0&size=10")
COUNT=$(grep -o '"id"' /tmp/r1.json | wc -l)
log 1 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/movies" "HTTP=$HTTP movies=$COUNT"

# T2
HTTP=$(curl -s -o /tmp/r2.json -w "%{http_code}" "$BASE/api/movies/$MOVIE_ID")
log 2 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/movies/{id}" "HTTP=$HTTP"

# T3
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/movies/nonexistent")
log 3 "$([ "$HTTP" = "404" ] && echo PASS || echo FAIL)" "GET /api/movies/{id} 404" "HTTP=$HTTP"

# T4
HTTP=$(curl -s -o /tmp/r4.json -w "%{http_code}" "$BASE/api/movies/search?q=dune")
RCOUNT=$(grep -o '"id"' /tmp/r4.json | wc -l)
log 4 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "Search q=dune" "HTTP=$HTTP results=$RCOUNT"

# T5
HTTP=$(curl -s -o /tmp/r5.json -w "%{http_code}" "$BASE/api/movies/search?q=nonexistentxyz")
log 5 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "Search nonexistent" "HTTP=$HTTP"

# T6
HTTP=$(curl -s -o /tmp/r6.json -w "%{http_code}" "$BASE/api/movies?page=0&size=3")
log 6 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "Pagination" "HTTP=$HTTP"

# T7
HTTP=$(curl -s -o /tmp/r7.json -w "%{http_code}" "$BASE/api/movies?genre=Sci-Fi")
GCOUNT=$(grep -o '"id"' /tmp/r7.json | wc -l)
log 7 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "Filter genre=Sci-Fi" "HTTP=$HTTP count=$GCOUNT"

# T8
HTTP=$(curl -s -o /tmp/r8.json -w "%{http_code}" "$BASE/api/movies?sort=rating&sortDir=desc&size=20")
RATINGS=$(grep -o '"rating":[0-9.]*' /tmp/r8.json | cut -d: -f2 | tr '\n' ',' | sed 's/,$//')
log 8 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "Sort rating desc" "HTTP=$HTTP ratings=[$RATINGS]"

# T9
HTTP=$(curl -s -o /tmp/r9.json -w "%{http_code}" "$BASE/api/movies?sort=rating&sortDir=asc&size=20")
RATINGS_ASC=$(grep -o '"rating":[0-9.]*' /tmp/r9.json | cut -d: -f2 | tr '\n' ',' | sed 's/,$//')
log 9 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "Sort rating asc" "HTTP=$HTTP ratings=[$RATINGS_ASC]"

# T10
HTTP=$(curl -s -o /tmp/r10.json -w "%{http_code}" -X POST "$BASE/api/movies" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"title":"Test Movie","tagline":"A test","poster":"https://example.com/p.jpg","backdrop":"https://example.com/b.jpg","rating":7.5,"duration":120,"genre":["Drama","Action"],"language":"English","releaseDate":"2026-05-01","director":"Test Dir","cast":["Actor A"],"description":"Desc","premiumPrice":19.99,"regularPrice":9.99}')
NEW_ID=$(grep -o '"id":"[^"]*"' /tmp/r10.json | head -1 | cut -d'"' -f4)
log 10 "$([ "$HTTP" = "201" ] && echo PASS || echo FAIL)" "POST /api/movies (admin)" "HTTP=$HTTP id=$NEW_ID"

# T11
HTTP=$(curl -s -o /tmp/r11.json -w "%{http_code}" -X PUT "$BASE/api/movies/$NEW_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"title":"Updated Movie","tagline":"Updated","poster":"https://example.com/p2.jpg","backdrop":"https://example.com/b2.jpg","rating":8.0,"duration":130,"genre":["Thriller"],"language":"English","releaseDate":"2026-06-01","director":"New Dir","cast":["Actor B"],"description":"Updated","premiumPrice":21.99,"regularPrice":11.99}')
log 11 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "PUT /api/movies/{id}" "HTTP=$HTTP"

# T12
HTTP=$(curl -s -o /tmp/r12.json -w "%{http_code}" -X PATCH "$BASE/api/movies/$NEW_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"rating":6.5}')
log 12 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "PATCH /api/movies/{id}" "HTTP=$HTTP"

# T13
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/movies" \
  -H "Content-Type: application/json" -d '{"title":"X"}')
log 13 "$([ "$HTTP" = "403" ] && echo PASS || echo FAIL)" "POST no auth" "HTTP=$HTTP"

# T14
HTTP=$(curl -s -o /tmp/r14.json -w "%{http_code}" -X POST "$BASE/api/movies" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"title":"Only Title"}')
log 14 "$([ "$HTTP" = "400" ] && echo PASS || echo FAIL)" "POST missing fields" "HTTP=$HTTP"

# T15
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/movies" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"title":"X","tagline":"T","poster":"https://example.com/p.jpg","backdrop":"https://example.com/b.jpg","rating":15,"duration":120,"genre":["Drama"],"language":"English","releaseDate":"2026-05-01","director":"D","cast":["A"],"description":"Desc","premiumPrice":10,"regularPrice":5}')
log 15 "$([ "$HTTP" = "400" ] && echo PASS || echo FAIL)" "POST rating=15" "HTTP=$HTTP"

# T16
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/movies" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"title":"X","tagline":"T","poster":"not-a-url","backdrop":"https://example.com/b.jpg","rating":5,"duration":120,"genre":["Drama"],"language":"English","releaseDate":"2026-05-01","director":"D","cast":["A"],"description":"Desc","premiumPrice":10,"regularPrice":5}')
log 16 "$([ "$HTTP" = "400" ] && echo PASS || echo FAIL)" "POST invalid poster" "HTTP=$HTTP"

# T17
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/movies/$NEW_ID")
log 17 "$([ "$HTTP" = "403" ] && echo PASS || echo FAIL)" "DELETE no auth" "HTTP=$HTTP"

# T18
HTTP=$(curl -s -o /tmp/r18.json -w "%{http_code}" "$BASE/api/theaters")
TCOUNT=$(grep -o '"id"' /tmp/r18.json | wc -l)
log 18 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/theaters" "HTTP=$HTTP count=$TCOUNT"

# T19
HTTP=$(curl -s -o /tmp/r19.json -w "%{http_code}" "$BASE/api/theaters/$THEATER_ID")
log 19 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/theaters/{id}" "HTTP=$HTTP"

# T20
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/theaters/nonexistent")
log 20 "$([ "$HTTP" = "404" ] && echo PASS || echo FAIL)" "GET /api/theaters 404" "HTTP=$HTTP"

# T21
HTTP=$(curl -s -o /tmp/r21.json -w "%{http_code}" -X POST "$BASE/api/theaters" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"name":"Test Theater","address":"123 Test St","screens":5,"amenities":["3D","Bar"]}')
NEW_THEATER_ID=$(grep -o '"id":"[^"]*"' /tmp/r21.json | head -1 | cut -d'"' -f4)
log 21 "$([ "$HTTP" = "201" ] && echo PASS || echo FAIL)" "POST /api/theaters (admin)" "HTTP=$HTTP id=$NEW_THEATER_ID"

# T22
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/theaters/$NEW_THEATER_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d '{"name":"Updated Theater","address":"456 New St","screens":10,"amenities":["IMAX","VIP"]}')
log 22 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "PUT /api/theaters/{id}" "HTTP=$HTTP"

# T23
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/theaters/$NEW_THEATER_ID" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN")
log 23 "$([ "$HTTP" = "204" ] && echo PASS || echo FAIL)" "DELETE /api/theaters (admin)" "HTTP=$HTTP"

# T24
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/theaters" \
  -H "Content-Type: application/json" \
  -d '{"name":"X","address":"A","screens":1,"amenities":[]}')
log 24 "$([ "$HTTP" = "403" ] && echo PASS || echo FAIL)" "POST /api/theaters no auth" "HTTP=$HTTP"

# Create showtime
HTTP=$(curl -s -o /tmp/r_show.json -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-01\",\"time\":\"18:00\",\"screenNumber\":1,\"remainingSeats\":100}")
SHOWTIME_ID=$(grep -o '"id":"[^"]*"' /tmp/r_show.json | head -1 | cut -d'"' -f4)
echo "Showtime ID: $SHOWTIME_ID"

# T25
log 25 "$([ "$HTTP" = "201" ] && echo PASS || echo FAIL)" "POST /api/showtimes (admin)" "HTTP=$HTTP"

# T26
HTTP=$(curl -s -o /tmp/r26.json -w "%{http_code}" "$BASE/api/movies/$MOVIE_ID/showtimes")
SCOUNT=$(grep -o '"id"' /tmp/r26.json | wc -l)
log 26 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/movies/{id}/showtimes" "HTTP=$HTTP count=$SCOUNT"

# T27
HTTP=$(curl -s -o /tmp/r27.json -w "%{http_code}" "$BASE/api/movies/$MOVIE_ID/showtimes?date=2026-05-01")
log 27 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET showtimes date filter" "HTTP=$HTTP"

# T28
HTTP=$(curl -s -o /tmp/r28.json -w "%{http_code}" "$BASE/api/theaters/$THEATER_ID/showtimes")
log 28 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/theaters/{id}/showtimes" "HTTP=$HTTP"

# T29
HTTP=$(curl -s -o /tmp/r29.json -w "%{http_code}" "$BASE/api/showtimes/$SHOWTIME_ID")
log 29 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /api/showtimes/{id}" "HTTP=$HTTP"

# T30
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/showtimes/nonexistent")
log 30 "$([ "$HTTP" = "404" ] && echo PASS || echo FAIL)" "GET /api/showtimes 404" "HTTP=$HTTP"

# T31
HTTP=$(curl -s -o /tmp/r31.json -w "%{http_code}" "$BASE/api/movies/$MOVIE_ID/showtimes?embed=true")
HAS_THEATER=$(grep -c 'theater' /tmp/r31.json)
log 31 "$([ "$HTTP" = "200" ] && [ "$HAS_THEATER" -gt 0 ] && echo PASS || echo FAIL)" "GET showtimes embed=true" "HTTP=$HTTP theaterFields=$HAS_THEATER"

# T32
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/showtimes/$SHOWTIME_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-01\",\"time\":\"20:00\",\"screenNumber\":1,\"remainingSeats\":80}")
log 32 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "PUT /api/showtimes/{id}" "HTTP=$HTTP"

# T33
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/showtimes/$SHOWTIME_ID" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN")
log 33 "$([ "$HTTP" = "204" ] && echo PASS || echo FAIL)" "DELETE /api/showtimes (admin)" "HTTP=$HTTP"

# T34: DELETE no auth - create fresh showtime first
HTTP2=$(curl -s -o /tmp/r_show2.json -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-02\",\"time\":\"18:00\",\"screenNumber\":1,\"remainingSeats\":100}")
SHOWTIME_ID2=$(grep -o '"id":"[^"]*"' /tmp/r_show2.json | head -1 | cut -d'"' -f4)
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/showtimes/$SHOWTIME_ID2")
log 34 "$([ "$HTTP" = "403" ] && echo PASS || echo FAIL)" "DELETE /api/showtimes no auth" "HTTP=$HTTP"

# T35: duplicate showtime
curl -s -o /dev/null -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-10\",\"time\":\"15:00\",\"screenNumber\":3,\"remainingSeats\":100}" > /dev/null
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-10\",\"time\":\"15:00\",\"screenNumber\":3,\"remainingSeats\":100}")
log 35 "$([ "$HTTP" = "409" ] && echo PASS || echo FAIL)" "POST duplicate showtime" "HTTP=$HTTP"

# T36
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"invalidId\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-01\",\"time\":\"18:00\",\"screenNumber\":1,\"remainingSeats\":100}")
log 36 "$([ "$HTTP" = "422" ] && echo PASS || echo FAIL)" "POST invalid movieId" "HTTP=$HTTP"

# T37
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"invalidId\",\"date\":\"2026-05-01\",\"time\":\"18:00\",\"screenNumber\":1,\"remainingSeats\":100}")
log 37 "$([ "$HTTP" = "422" ] && echo PASS || echo FAIL)" "POST invalid theaterId" "HTTP=$HTTP"

# T38
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-01\",\"time\":\"25:00\",\"screenNumber\":1,\"remainingSeats\":100}")
log 38 "$([ "$HTTP" = "400" ] && echo PASS || echo FAIL)" "POST invalid time" "HTTP=$HTTP"

# T39
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"not-a-date\",\"time\":\"18:00\",\"screenNumber\":1,\"remainingSeats\":100}")
log 39 "$([ "$HTTP" = "400" ] && echo PASS || echo FAIL)" "POST invalid date" "HTTP=$HTTP"

# T40
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/showtimes" \
  -H "Content-Type: application/json" \
  -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"date\":\"2026-05-01\",\"time\":\"18:00\",\"screenNumber\":1,\"remainingSeats\":100}")
log 40 "$([ "$HTTP" = "403" ] && echo PASS || echo FAIL)" "POST showtime no auth" "HTTP=$HTTP"

# T41
HTTP=$(curl -s -o /tmp/r41.json -w "%{http_code}" "$BASE/health")
log 41 "$([ "$HTTP" = "200" ] && echo PASS || echo FAIL)" "GET /health" "HTTP=$HTTP"

# T42
HTTP=$(curl -s -o /tmp/r42.json -w "%{http_code}" "$BASE/api/movies/nonexistent")
HAS_TS=$(grep -c 'timestamp' /tmp/r42.json)
HAS_STATUS=$(grep -c '"status"' /tmp/r42.json)
HAS_MSG=$(grep -c '"message"' /tmp/r42.json)
log 42 "$([ "$HAS_TS" -gt 0 ] && [ "$HAS_STATUS" -gt 0 ] && [ "$HAS_MSG" -gt 0 ] && echo PASS || echo FAIL)" "Error response format" "ts=$HAS_TS status=$HAS_STATUS msg=$HAS_MSG"

# Cleanup
curl -s -o /dev/null -X DELETE "$BASE/api/movies/$NEW_ID" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" 2>/dev/null
curl -s -o /dev/null -X DELETE "$BASE/api/showtimes/$SHOWTIME_ID2" \
  -H "X-User-ID: admin-1" -H "X-User-Name: Admin" -H "X-User-Roles: ADMIN" 2>/dev/null

TOTAL=$((PASS+FAIL))
echo ""
echo "============================================="
echo "  Total: $TOTAL | Passed: $PASS | Failed: $FAIL"
echo "============================================="
echo ""
printf "%b\n" "$RESULTS"
echo ""
echo "---FAILURES---"
printf "%b" "$RESULTS" | grep -i FAIL || echo "None"
