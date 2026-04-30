# Dimeo Work Assistance – API Sample Requests & Responses

> Replace `{{BASE_URL}}` with your API Gateway base URL, e.g.  
> `https://abc123.execute-api.ap-southeast-1.amazonaws.com`  
> For local testing set it to `http://localhost:3000`.

---

## Sites Lambda

### POST /sites — Create a site

**Request**
```http
POST {{BASE_URL}}/sites
Content-Type: application/json

{
  "name": "City Tower Office Block",
  "address": "36 Union Place, Colombo 02",
  "latitude": 6.9147,
  "longitude": 79.8554,
  "proximity_radius_m": 150
}
```

**Response `201 Created`**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "City Tower Office Block",
  "address": "36 Union Place, Colombo 02",
  "latitude": 6.9147,
  "longitude": 79.8554,
  "proximity_radius_m": 150,
  "created_at": "2026-04-28T08:00:00Z",
  "updated_at": "2026-04-28T08:00:00Z"
}
```

---

### GET /sites — List all sites

**Request**
```http
GET {{BASE_URL}}/sites
```

**Response `200 OK`**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "City Tower Office Block",
    "address": "36 Union Place, Colombo 02",
    "latitude": 6.9147,
    "longitude": 79.8554,
    "proximity_radius_m": 150,
    "created_at": "2026-04-28T08:00:00Z",
    "updated_at": "2026-04-28T08:00:00Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Harbour View Apartments",
    "address": "Marine Drive, Colombo 03",
    "latitude": 6.9325,
    "longitude": 79.8502,
    "proximity_radius_m": 100,
    "created_at": "2026-04-28T09:00:00Z",
    "updated_at": "2026-04-28T09:00:00Z"
  }
]
```

---

### GET /sites/{id} — Get a single site

**Request**
```http
GET {{BASE_URL}}/sites/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response `200 OK`**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "City Tower Office Block",
  "address": "36 Union Place, Colombo 02",
  "latitude": 6.9147,
  "longitude": 79.8554,
  "proximity_radius_m": 150,
  "created_at": "2026-04-28T08:00:00Z",
  "updated_at": "2026-04-28T08:00:00Z"
}
```

**Response `404 Not Found`**
```json
{ "error": "site not found" }
```

---

### DELETE /sites/{id} — Delete a site

**Request**
```http
DELETE {{BASE_URL}}/sites/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response `204 No Content`**
*(empty body)*

---

## Employees Lambda

### POST /employees — Create an employee

**Request**
```http
POST {{BASE_URL}}/employees
Content-Type: application/json

{
  "name": "Kasun Perera",
  "email": "kasun.perera@dimeo.lk",
  "phone": "+94771234567"
}
```

**Response `201 Created`**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "name": "Kasun Perera",
  "email": "kasun.perera@dimeo.lk",
  "phone": "+94771234567",
  "created_at": "2026-04-28T08:05:00Z",
  "updated_at": "2026-04-28T08:05:00Z"
}
```

---

### GET /employees — List all employees

**Request**
```http
GET {{BASE_URL}}/employees
```

**Response `200 OK`**
```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Kasun Perera",
    "email": "kasun.perera@dimeo.lk",
    "phone": "+94771234567",
    "created_at": "2026-04-28T08:05:00Z",
    "updated_at": "2026-04-28T08:05:00Z"
  },
  {
    "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "name": "Nimali Silva",
    "email": "nimali.silva@dimeo.lk",
    "phone": "+94769876543",
    "created_at": "2026-04-28T08:10:00Z",
    "updated_at": "2026-04-28T08:10:00Z"
  }
]
```

---

### GET /employees/{id} — Get a single employee

**Request**
```http
GET {{BASE_URL}}/employees/c3d4e5f6-a7b8-9012-cdef-123456789012
```

**Response `200 OK`**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "name": "Kasun Perera",
  "email": "kasun.perera@dimeo.lk",
  "phone": "+94771234567",
  "created_at": "2026-04-28T08:05:00Z",
  "updated_at": "2026-04-28T08:05:00Z"
}
```

**Response `404 Not Found`**
```json
{ "error": "employee not found" }
```

---

### POST /employees/assign — Assign an employee to a site

**Request**
```http
POST {{BASE_URL}}/employees/assign
Content-Type: application/json

{
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response `201 Created`**
```json
{
  "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "assigned_at": "2026-04-28T08:15:00Z",
  "active": true
}
```

---

### GET /employees/site/{siteId} — List employees assigned to a site

**Request**
```http
GET {{BASE_URL}}/employees/site/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response `200 OK`**
```json
[
  {
    "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
    "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "assigned_at": "2026-04-28T08:15:00Z",
    "active": true
  }
]
```

---

## Attendance Lambda

### POST /attendance/sign-in — Sign in at a site

The employee's GPS coordinates are checked against the site's `proximity_radius_m`. The request will be rejected if the employee is too far away.

**Request**
```http
POST {{BASE_URL}}/attendance/sign-in
Content-Type: application/json

{
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "latitude": 6.9148,
  "longitude": 79.8555
}
```

**Response `201 Created`**
```json
{
  "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "sign_in_at": "2026-04-28T08:30:00Z",
  "sign_in_lat": 6.9148,
  "sign_in_lon": 79.8555,
  "status": "in_progress",
  "created_at": "2026-04-28T08:30:00Z"
}
```

**Response `400 Bad Request` (employee out of range)**
```json
{ "error": "employee is too far from the site (distance: 320m, allowed: 150m)" }
```

---

### POST /attendance/sign-out — Sign out from a site

**Request**
```http
POST {{BASE_URL}}/attendance/sign-out
Content-Type: application/json

{
  "attendance_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "latitude": 6.9149,
  "longitude": 79.8556
}
```

**Response `200 OK`**
```json
{
  "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "sign_in_at": "2026-04-28T08:30:00Z",
  "sign_out_at": "2026-04-28T16:45:00Z",
  "sign_in_lat": 6.9148,
  "sign_in_lon": 79.8555,
  "sign_out_lat": 6.9149,
  "sign_out_lon": 79.8556,
  "status": "completed",
  "created_at": "2026-04-28T08:30:00Z"
}
```

**Response `400 Bad Request` (employee out of range)**
```json
{ "error": "employee is too far from the site (distance: 280m, allowed: 150m)" }
```

---

### GET /attendance/{id} — Get an attendance record

**Request**
```http
GET {{BASE_URL}}/attendance/f6a7b8c9-d0e1-2345-fabc-456789012345
```

**Response `200 OK`**
```json
{
  "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "sign_in_at": "2026-04-28T08:30:00Z",
  "sign_out_at": "2026-04-28T16:45:00Z",
  "sign_in_lat": 6.9148,
  "sign_in_lon": 79.8555,
  "sign_out_lat": 6.9149,
  "sign_out_lon": 79.8556,
  "status": "completed",
  "created_at": "2026-04-28T08:30:00Z"
}
```

**Response `404 Not Found`**
```json
{ "error": "attendance record not found" }
```

---

## Location Ingest Lambda

### POST /locations — Record a GPS ping

Called periodically by the mobile app during an active work session (status `in_progress`).

**Request**
```http
POST {{BASE_URL}}/locations
Content-Type: application/json

{
  "attendance_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "latitude": 6.9150,
  "longitude": 79.8557
}
```

**Response `201 Created`**
```json
{
  "id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
  "attendance_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "latitude": 6.9150,
  "longitude": 79.8557,
  "recorded_at": "2026-04-28T10:00:00Z"
}
```

---

### GET /locations?attendance_id={id} — Get all pings for a work session

**Request**
```http
GET {{BASE_URL}}/locations?attendance_id=f6a7b8c9-d0e1-2345-fabc-456789012345
```

**Response `200 OK`**
```json
[
  {
    "id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
    "attendance_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "latitude": 6.9150,
    "longitude": 79.8557,
    "recorded_at": "2026-04-28T10:00:00Z"
  },
  {
    "id": "b8c9d0e1-f2a3-4567-bcde-678901234567",
    "attendance_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "latitude": 6.9151,
    "longitude": 79.8558,
    "recorded_at": "2026-04-28T10:05:00Z"
  }
]
```

---

### GET /locations?employee_id={id} — Get all pings for an employee

**Request**
```http
GET {{BASE_URL}}/locations?employee_id=c3d4e5f6-a7b8-9012-cdef-123456789012
```

**Response `200 OK`**
```json
[
  {
    "id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
    "attendance_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "employee_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "site_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "latitude": 6.9150,
    "longitude": 79.8557,
    "recorded_at": "2026-04-28T10:00:00Z"
  }
]
```

---

## Common Error Responses

| Status | Body | When |
|--------|------|------|
| `400` | `{ "error": "invalid request body" }` | Malformed JSON |
| `400` | `{ "error": "missing path parameter: id" }` | DELETE without an id |
| `400` | `{ "error": "provide query param: attendance_id or employee_id" }` | GET /locations with no query params |
| `404` | `{ "error": "site not found" }` | ID does not exist |
| `404` | `{ "error": "employee not found" }` | ID does not exist |
| `404` | `{ "error": "attendance record not found" }` | ID does not exist |
| `405` | `{ "error": "method not allowed" }` | Unsupported HTTP method |
| `500` | `{ "error": "<db error message>" }` | Unexpected server/database error |

---

## cURL Quick Reference

```bash
BASE=https://abc123.execute-api.ap-southeast-1.amazonaws.com

# Create site
curl -s -X POST $BASE/sites \
  -H 'Content-Type: application/json' \
  -d '{"name":"City Tower","address":"36 Union Pl","latitude":6.9147,"longitude":79.8554,"proximity_radius_m":150}'

# List sites
curl -s $BASE/sites

# Create employee
curl -s -X POST $BASE/employees \
  -H 'Content-Type: application/json' \
  -d '{"name":"Kasun Perera","email":"kasun@dimeo.lk","phone":"+94771234567"}'

# Assign employee to site
curl -s -X POST $BASE/employees/assign \
  -H 'Content-Type: application/json' \
  -d '{"employee_id":"<EMPLOYEE_ID>","site_id":"<SITE_ID>"}'

# Sign in
curl -s -X POST $BASE/attendance/sign-in \
  -H 'Content-Type: application/json' \
  -d '{"employee_id":"<EMPLOYEE_ID>","site_id":"<SITE_ID>","latitude":6.9148,"longitude":79.8555}'

# Sign out
curl -s -X POST $BASE/attendance/sign-out \
  -H 'Content-Type: application/json' \
  -d '{"attendance_id":"<ATTENDANCE_ID>","latitude":6.9149,"longitude":79.8556}'

# Record GPS ping
curl -s -X POST $BASE/locations \
  -H 'Content-Type: application/json' \
  -d '{"attendance_id":"<ATT_ID>","employee_id":"<EMP_ID>","site_id":"<SITE_ID>","latitude":6.9150,"longitude":79.8557}'

# Get pings for a session
curl -s "$BASE/locations?attendance_id=<ATTENDANCE_ID>"
```
