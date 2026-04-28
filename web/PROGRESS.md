# Web Admin Panel – Progress Tracker

## Status: In Progress

---

## ✅ Completed

### 1. Project Scaffolded
- Framework: **React + Vite** (`vite@8`, `react@19`)
- Module: `web@0.0.0`
- Build confirmed: ✓ 87 modules transformed, 0 errors

---

### 2. Dependencies Installed

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `@vis.gl/react-google-maps` | Google Maps integration |
| `axios` | HTTP client for Lambda API calls |
| `react-hot-toast` | Toast notifications |

---

### 3. Project Structure

```
web/
├── .env.example               # API URL + Google Maps key placeholders
├── .env.local                 # Local dev config (gitignored)
├── index.html
├── src/
│   ├── main.jsx               # App entry point with BrowserRouter
│   ├── index.css              # Global reset
│   ├── App.jsx                # Route definitions
│   │
│   ├── api/
│   │   └── client.js          # Axios wrapper for all backend Lambda calls
│   │
│   ├── components/
│   │   └── Layout/
│   │       ├── Layout.jsx     # Sidebar nav shell (Outlet-based)
│   │       └── Layout.module.css
│   │
│   └── pages/
│       ├── Sites/
│       │   ├── Sites.jsx
│       │   └── Sites.module.css
│       ├── Employees/
│       │   ├── Employees.jsx
│       │   └── Employees.module.css
│       └── Attendance/
│           ├── Attendance.jsx
│           └── Attendance.module.css
```

---

### 4. Pages Implemented

#### Sites (`/sites`)
- Displays a **Google Map** using `@vis.gl/react-google-maps`
- Click anywhere on the map to drop a pin
- A form panel slides in to enter site name, address, and check-in radius (metres)
- Existing sites shown as **AdvancedMarkers** with **InfoWindow** on click
- Sites listed in a sidebar panel
- Delete a site from the list or via InfoWindow
- Calls: `GET /sites`, `POST /sites`, `DELETE /sites/{id}`

#### Employees (`/employees`)
- Table of all employees (name, email, phone)
- **Create Employee** modal form
- **Assign to Site** modal — select a site from dropdown, posts assignment to backend
- Expandable **Site Assignments** section — click a site to load its currently assigned employees
- Calls: `GET /employees`, `POST /employees`, `POST /employees/assign`, `GET /employees/site/{siteId}`

#### Attendance (`/attendance`)
- Toggle between **Sign In** and **Sign Out** tabs
- Sign-in: select employee + site, enter or auto-detect GPS coordinates
- Sign-out: paste attendance ID, enter or auto-detect GPS coordinates
- **"Use My Location"** button uses the browser Geolocation API
- Proximity errors from the backend (employee too far from site) displayed as toast errors
- Last API response shown as formatted JSON for debugging
- Calls: `POST /attendance/sign-in`, `POST /attendance/sign-out`

---

### 5. API Client (`src/api/client.js`)

All Lambda function endpoints wired up:

| Function | Methods covered |
|---|---|
| Sites Lambda | `GET /sites`, `GET /sites/:id`, `POST /sites`, `DELETE /sites/:id` |
| Employee Lambda | `GET /employees`, `GET /employees/:id`, `POST /employees`, `POST /employees/assign`, `GET /employees/site/:siteId` |
| Attendance Lambda | `POST /attendance/sign-in`, `POST /attendance/sign-out`, `GET /attendance/:id` |
| Location Lambda | `POST /locations`, `GET /locations?attendance_id=`, `GET /locations?employee_id=` |

---

## ⚙️ Configuration Required

Before running locally:

1. Copy `.env.example` → `.env.local`
2. Set `VITE_API_BASE_URL` to your API Gateway base URL
3. Set `VITE_GOOGLE_MAPS_API_KEY` to your Google Maps JavaScript API key

```bash
npm run dev    # start dev server at http://localhost:5173
npm run build  # production build
```

---

## 🔲 TODO (Next Steps)

- [ ] **Location tracking page** — view GPS ping history for a work session on a map (polyline route)
- [ ] **Authentication** — add Cognito/JWT login so managers must sign in before accessing the panel
- [ ] **Dashboard / overview** — summary cards: total sites, active workers today, recent sign-ins
- [ ] **Paginate large lists** — employees and location tracks can grow large
- [ ] **Environment-specific builds** — dev / staging / prod `.env` files for AWS deployments
- [ ] **Error boundary** — global React error boundary to catch unexpected render failures
