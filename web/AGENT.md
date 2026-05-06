# Web Admin Panel Agent — Dimeo Work Assistance

## Purpose

This layer is the manager-facing web portal for the Dimeo Work Assistance platform. Managers use it to create and manage cleaning sites on an interactive map, assign employees to sites, and monitor attendance activity.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Routing | React Router DOM v7 |
| UI components | IBM Carbon Design System (`@carbon/react`, `@carbon/icons-react`) |
| Maps | `@vis.gl/react-google-maps` |
| HTTP client | Axios |
| Notifications | react-hot-toast |
| Styles | SCSS (Sass) |
| Linting | ESLint 10 with React hooks + fast-refresh plugins |

---

## Project Structure

```
web/
├── src/
│   ├── main.tsx              # Entry point — mounts React app with BrowserRouter
│   ├── App.tsx               # Route definitions
│   ├── types.ts              # Shared TypeScript interfaces (Site, Employee, etc.)
│   ├── api/                  # Axios wrappers — all API calls centralised here
│   ├── components/
│   │   └── Layout/           # Shell layout with left navigation
│   ├── context/              # React context providers (shared state)
│   └── pages/
│       ├── Sites/            # Site management with Google Maps
│       ├── Employees/        # Employee CRUD and site assignments
│       └── Attendance/       # Sign-in/out interface with GPS detection
├── .env.example              # Environment variable template
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Pages

### Sites (`/sites`)
- Lists all cleaning sites in a tabular format.
- Horizontal sub-menu tabs: **Location Setup** | **Employee Assignment** | **Supply Management**
- Default tab: Location Setup.
- Add Site flow: presents a Google Maps panel with a search bar; user searches for a location, pins it, and saves — coordinates are sent to the backend.
- Delete site action per row.

### Employees (`/employees`)
- Full employee CRUD (create, list, view, delete).
- Expandable per-site employee lists.
- Assign/unassign employees to sites.

### Attendance (`/attendance`)
- Sign-in and sign-out interface.
- Auto-detects employee GPS location via the browser Geolocation API.
- Displays a proximity error if the employee is too far from the assigned site.

---

## Routing

All routes are nested under the `Layout` shell component:

| Path | Component |
|---|---|
| `/` | Redirects to `/sites` |
| `/sites` | Sites page |
| `/employees` | Employees page |
| `/attendance` | Attendance page |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
VITE_API_BASE_URL=<API Gateway base URL>
VITE_GOOGLE_MAPS_API_KEY=<Google Maps API key>
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

---

## API Integration

All backend calls are made through `src/api/`. Never call `axios` directly from pages or components — add a function to the appropriate api module instead. The base URL is read from `import.meta.env.VITE_API_BASE_URL`.

---

## Outstanding Work

- [ ] Authentication (login page, token storage, protected routes) — Cognito or JWT
- [ ] Dashboard / home page with summary metrics
- [ ] Location tracking page (map view of employee GPS pings during a session)
- [ ] Pagination and search for Sites and Employees tables
- [ ] Supply Management tab content under Sites
- [ ] Error boundary and loading skeleton components

---

## Coding Conventions

- All shared TypeScript types live in `src/types.ts`. Do not define the same type twice.
- All API calls go through `src/api/`. Keep pages free of raw `axios` calls.
- Use Carbon components (`@carbon/react`) for all UI elements before reaching for custom HTML.
- Toast notifications via `react-hot-toast` for all user-facing success/error feedback.
- SCSS files are co-located with the component they style.
- Keep page components focused on layout and state orchestration; extract complex UI blocks into sub-components within the page folder.
