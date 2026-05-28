# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + Vite + Tailwind CSS v4 movie ticket booking system with a dark/cinematic theme. The app uses React Router for navigation, React Context API for state management, and mock data for movies/theaters/showtimes.

## Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production (skips tsc — Vite handles types)
npm run preview  # Preview the production build
```

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, NOT the old CLI)
- **Routing**: React Router v7
- **State**: React Context API (`AuthContext` with `isLoggedIn`, `BookingContext`)
- **Language**: TypeScript

## Architecture

```
src/
├── App.tsx                   # Root — wraps providers
├── components/
│   ├── common/               # Shared: Navbar, Footer
│   └── features/            # Feature modules:
│       ├── movies/          # MovieCard, MovieGrid
│       ├── seats/           # SeatMap, SeatRow, SeatLegend
│       └── booking/         # BookingSummary
├── pages/                   # Route-level pages
│   ├── Home/                # Movie listing
│   ├── MovieDetail/         # Movie info + showtime selection
│   ├── SeatSelection/       # Interactive seat picker
│   ├── Confirmation/        # Booking ticket with QR
│   ├── Auth/                # Login + Register with validation
│   ├── Profile/             # User profile + booking history
│   └── Admin/               # Movie + booking management
├── hooks/                   # useMovies
├── store/                   # AuthContext (with isLoggedIn), BookingContext
├── services/                # movieService, bookingService, authService, api (axios)
├── data/                    # Mock: movies, theaters, showtimes
├── utils/                   # formatDate, formatPrice, generateTicketId
├── constants/               # config, routes, seatTypes
└── styles/                  # global.css, variables.css (dark theme tokens)
```

## Key Conventions

- All route paths are defined in `src/constants/routes.ts` — no string literals in components
- Seat types defined in `src/constants/seatTypes.ts`
- Booking confirmation uses React state/navigation (`navigate` with `state`) — no URL params for booking data
- Page components at `src/pages/<Page>/` import from `../../constants/` (2 levels up)
- Feature components at `src/components/features/<feature>/` import from `../../../constants/` (3 levels up)
- CSS Modules (`.module.css`) used for component styles; Tailwind for page/layout styles
- Environment variable `VITE_API_BASE_URL` (`.env`, default `http://localhost:8000`) controls all API calls — `config.ts` and `api.ts` both read it with different fallbacks

## API Interceptor (`src/services/api.ts`)

- Axios instance auto-attaches `Authorization: Bearer` header from `localStorage('access_token')`
- On 401, interceptors queue failed requests, refresh token via `authService.refreshToken()`, and retry
- If refresh fails, dispatches `auth:logout` event and redirects to `/auth/login`
- **Known issue:** `api.ts:70` accesses `response.accessToken` (camelCase) but the API returns `access_token` (snake_case) — token refresh silently fails after a 401

## JWT Decoding

- `src/utils/jwtDecode.ts` is a custom base64url decoder (uses `atob`, NOT the `jwt-decode` npm package)
- Used by `extractRoles()` and `extractUserName()` in `AuthContext.tsx` to decode JWT payloads
- The padding formula was a past source of bugs — verify with `'='.repeat((4 - payload.length % 4) % 4)`

## Real API Types (`src/types/index.ts`)

- `ShowtimeResponseDTO.slots` (array of `ShowSlot`) drives dynamic seat map layout — `rows`, `cols`, `premiumCols`, and `aisleAfterCol` are all 1-based
- `Movie` type has **no pricing** — prices come from `ShowSlot` (admin sets per-showtime pricing)
- `Booking` interface holds the full booking state including `movie`, `showtime`, `slot`, `seats`, and `totalPrice`

## API Response Format

- **Backend uses snake_case** for all response keys — never camelCase. Key fields:
  - `access_token` (not `accessToken`) — JWT token with roles in payload
  - `user_name` (not `userName`) — returned as `null` by login/refresh, populated by signup/OTP-verify
  - `token` — refresh token (UUID string)
- JWT payload contains `sub` (username) and `roles: [{ roleId, name }]` — always extract from token, not API response
- `extractRoles()` and `extractUserName()` in `AuthContext.tsx` decode JWT to populate user state
- If both `response.user_name` and JWT `sub` are null, user state should not be set

## Auth Flow

1. Login/register stores `access_token`, `refresh_token`, and `user` in localStorage
2. On page load, `AuthContext` validates `access_token` expiry via JWT `exp` claim
3. If expired, attempts `refreshToken` with stored `refresh_token` — if that fails, clears all auth storage
4. `isAdmin` computed from `user.roles.includes('ROLE_ADMIN')` — never from API response

## Design Tokens (CSS Variables)

- Background: `--color-bg` (#0d0d12), `--color-bg-card` (#16161d)
- Primary: `--color-primary` (#aa3bff) — accent for buttons, selected states
- Seats: `--color-seat-available` (green), `--color-seat-selected` (purple), `--color-seat-premium` (amber), `--color-seat-booked` (gray)
