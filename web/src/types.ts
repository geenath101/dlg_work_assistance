// ── Domain models (mirror the Go backend structs) ─────────────────────────────

export interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  proximity_radius_m: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface SiteAssignment {
  id: string;
  site_id: string;
  employee_id: string;
  assigned_at: string;
  active: boolean;
}

export type AttendanceStatus = 'in_progress' | 'completed';

export interface AttendanceLog {
  id: string;
  site_id: string;
  employee_id: string;
  sign_in_at: string;
  sign_out_at?: string;
  sign_in_lat: number;
  sign_in_lon: number;
  sign_out_lat?: number;
  sign_out_lon?: number;
  status: AttendanceStatus;
  created_at: string;
}

export interface LocationTrack {
  id: string;
  attendance_id: string;
  employee_id: string;
  site_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface CreateSiteRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  proximity_radius_m: number;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone: string;
}

export interface AssignToSiteRequest {
  employee_id: string;
  site_id: string;
}

export interface SignInRequest {
  employee_id: string;
  site_id: string;
  latitude: number;
  longitude: number;
}

export interface SignOutRequest {
  attendance_id: string;
  latitude: number;
  longitude: number;
}

export interface RecordLocationRequest {
  attendance_id: string;
  employee_id: string;
  site_id: string;
  latitude: number;
  longitude: number;
}
