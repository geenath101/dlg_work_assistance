import axios from 'axios';
import type {
  Site,
  Employee,
  SiteAssignment,
  AttendanceLog,
  LocationTrack,
  CreateSiteRequest,
  CreateEmployeeRequest,
  AssignToSiteRequest,
  SignInRequest,
  SignOutRequest,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

// ── Sites ─────────────────────────────────────────────────────────────────────

export const getSites = (): Promise<Site[]> =>
  api.get<Site[]>('/sites').then((r) => r.data);

export const getSite = (id: string): Promise<Site> =>
  api.get<Site>(`/sites/${id}`).then((r) => r.data);

export const createSite = (data: CreateSiteRequest): Promise<Site> =>
  api.post<Site>('/sites', data).then((r) => r.data);

export const deleteSite = (id: string): Promise<void> =>
  api.delete(`/sites/${id}`).then(() => undefined);

// ── Employees ─────────────────────────────────────────────────────────────────

export const getEmployees = (): Promise<Employee[]> =>
  api.get<Employee[]>('/employees').then((r) => r.data);

export const getEmployee = (id: string): Promise<Employee> =>
  api.get<Employee>(`/employees/${id}`).then((r) => r.data);

export const createEmployee = (data: CreateEmployeeRequest): Promise<Employee> =>
  api.post<Employee>('/employees', data).then((r) => r.data);

export const assignEmployeeToSite = (data: AssignToSiteRequest): Promise<SiteAssignment> =>
  api.post<SiteAssignment>('/employees/assign', data).then((r) => r.data);

export const getAssignmentsBySite = (siteId: string): Promise<SiteAssignment[]> =>
  api.get<SiteAssignment[]>(`/employees/site/${siteId}`).then((r) => r.data);

// ── Attendance ────────────────────────────────────────────────────────────────

export const signIn = (data: SignInRequest): Promise<AttendanceLog> =>
  api.post<AttendanceLog>('/attendance/sign-in', data).then((r) => r.data);

export const signOut = (data: SignOutRequest): Promise<AttendanceLog> =>
  api.post<AttendanceLog>('/attendance/sign-out', data).then((r) => r.data);

export const getAttendance = (id: string): Promise<AttendanceLog> =>
  api.get<AttendanceLog>(`/attendance/${id}`).then((r) => r.data);

// ── Location tracks ───────────────────────────────────────────────────────────

export const getLocationsByAttendance = (attendanceId: string): Promise<LocationTrack[]> =>
  api
    .get<LocationTrack[]>('/locations', { params: { attendance_id: attendanceId } })
    .then((r) => r.data);

export const getLocationsByEmployee = (employeeId: string): Promise<LocationTrack[]> =>
  api
    .get<LocationTrack[]>('/locations', { params: { employee_id: employeeId } })
    .then((r) => r.data);
