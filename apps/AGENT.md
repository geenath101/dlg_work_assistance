# Mobile App Agent — Dimeo Work Assistance

## Purpose

This layer is the employee-facing mobile application for the Dimeo Work Assistance platform. Employees use it to sign in and out of work sessions at cleaning sites, with GPS proximity enforcement, and to send periodic location pings to the backend during active sessions.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Language | Kotlin |
| Platforms | Android and iOS |
| Architecture | To be decided (MVVM recommended) |
| GPS | Android Location API / iOS CoreLocation |
| HTTP | To be decided (Retrofit recommended for Android) |
| Auth | AWS Cognito (aligned with backend) |

---

## Project Structure

```
apps/
└── (not yet implemented)
```

The `apps/` directory exists but no code has been written yet. This document defines the expected structure and requirements for when development begins.

### Recommended Structure (Android)

```
apps/android/
├── app/src/main/
│   ├── java/com/dimeo/workassistance/
│   │   ├── ui/                  # Activities / Fragments / Composables
│   │   │   ├── login/
│   │   │   ├── home/            # Site list + sign-in/out button
│   │   │   └── session/         # Active session screen with live GPS
│   │   ├── data/
│   │   │   ├── api/             # Retrofit service interfaces
│   │   │   └── repository/      # Data access layer
│   │   ├── domain/              # Business logic (use cases)
│   │   └── service/
│   │       └── LocationService.kt  # Background GPS tracking service
│   └── res/
├── build.gradle.kts
└── AndroidManifest.xml
```

---

## Core Features to Implement

### 1. Authentication
- Employee logs in with credentials (Cognito user pool).
- Token stored securely; refreshed automatically.
- Logout clears session and stops any background services.

### 2. Site Selection
- Employee sees a list of sites they are assigned to.
- Each site shows name, address, and current assignment status.

### 3. Sign In
- Employee taps **Sign In** on their assigned site.
- App retrieves current GPS coordinates (one-shot fix).
- Sends `POST /attendance/sign-in` with employee ID, site ID, and GPS coordinates to the backend.
- Backend validates proximity (Haversine, within `proximity_radius_m`).
- App shows a clear error if the employee is too far from the site.
- On success, transitions to the active session screen.

### 4. Active Session — Location Tracking
- While a session is active, a background service sends GPS pings to `POST /locations` at a configurable interval (default: every 5 minutes).
- A persistent notification indicates the session is active.
- The interval should be configurable without an app release (e.g. fetched from backend or remote config).

### 5. Sign Out
- Employee taps **Sign Out**.
- App sends a final GPS fix to `POST /attendance/sign-out`.
- Backend validates proximity again before closing the session.
- Background location service is stopped.
- App returns to the site list screen.

---

## Backend API Endpoints Used

Refer to `backend/API_SAMPLES.md` for full request/response examples.

| Action | Method | Endpoint |
|---|---|---|
| Sign in | POST | `/attendance/sign-in` |
| Sign out | POST | `/attendance/sign-out` |
| Send location ping | POST | `/locations` |
| List assigned sites | GET | `/employees/{id}/sites` |

Base URL is the AWS API Gateway URL — should be stored in a build config or remote config, not hardcoded.

---

## Permissions Required

- `ACCESS_FINE_LOCATION` — precise GPS for sign-in/out proximity check
- `ACCESS_BACKGROUND_LOCATION` — GPS pings during active sessions (Android 10+)
- `FOREGROUND_SERVICE` — background location service
- `INTERNET` — API calls

---

## Key Constraints

- GPS proximity enforcement happens **server-side**. The app must not allow a sign-in/out by skipping the GPS check locally — the backend will reject it.
- Location pings must continue even when the app is in the background.
- Battery efficiency matters: use fused location provider (Android) or significant-change location (iOS) where appropriate for background pings.

---

## Outstanding Work

- [ ] Scaffold Android project (Kotlin, Gradle, MVVM)
- [ ] Scaffold iOS project if cross-platform build is not chosen
- [ ] Implement authentication with AWS Cognito
- [ ] Build site list and sign-in/out UI
- [ ] Implement foreground service for background GPS pings
- [ ] Handle GPS permission request flow (including background location rationale)
- [ ] Handle sign-in proximity errors gracefully in UI
- [ ] Decide on a cross-platform strategy (native Kotlin Multiplatform vs separate Android/iOS projects)

---

## Coding Conventions (when development begins)

- Follow MVVM: ViewModels hold state, repositories handle data access, UI observes state flows.
- No direct API calls from Activity/Fragment/Composable — always go through ViewModel → Repository.
- All GPS operations must respect the Android/iOS permission lifecycle; never assume the permission is granted.
- Background location service must use a foreground service with a user-visible notification (required by Android OS).
- Sensitive config (API base URL, Cognito pool ID) must not be committed to source control; use `local.properties` or equivalent.
