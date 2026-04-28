import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Sites ─────────────────────────────────────────────────────────────────────

export const getSites = () => api.get('/sites').then((r) => r.data);

export const getSite = (id) => api.get(`/sites/${id}`).then((r) => r.data);

export const createSite = (data) => api.post('/sites', data).then((r) => r.data);

export const deleteSite = (id) => api.delete(`/sites/${id}`);

// ── Employees ─────────────────────────────────────────────────────────────────

export const getEmployees = () => api.get('/employees').then((r) => r.data);

export const getEmployee = (id) => api.get(`/employees/${id}`).then((r) => r.data);

export const createEmployee = (data) => api.post('/employees', data).then((r) => r.data);

export const assignEmployeeToSite = (data) =>
  api.post('/employees/assign', data).then((r) => r.data);

export const getAssignmentsBySite = (siteId) =>
  api.get(`/employees/site/${siteId}`).then((r) => r.data);

// ── Attendance ────────────────────────────────────────────────────────────────

export const signIn = (data) => api.post('/attendance/sign-in', data).then((r) => r.data);

export const signOut = (data) => api.post('/attendance/sign-out', data).then((r) => r.data);

export const getAttendance = (id) => api.get(`/attendance/${id}`).then((r) => r.data);

// ── Location tracks ───────────────────────────────────────────────────────────

export const getLocationsByAttendance = (attendanceId) =>
  api.get('/locations', { params: { attendance_id: attendanceId } }).then((r) => r.data);

export const getLocationsByEmployee = (employeeId) =>
  api.get('/locations', { params: { employee_id: employeeId } }).then((r) => r.data);
