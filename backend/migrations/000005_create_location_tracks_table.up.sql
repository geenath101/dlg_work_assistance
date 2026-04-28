-- Stores periodic GPS pings sent from the mobile app throughout a work session.
-- High-volume table; consider partitioning by recorded_at as data grows.
CREATE TABLE location_tracks (
    id            TEXT             PRIMARY KEY,
    attendance_id TEXT             NOT NULL REFERENCES attendance_logs(id) ON DELETE CASCADE,
    employee_id   TEXT             NOT NULL REFERENCES employees(id),
    site_id       TEXT             NOT NULL REFERENCES sites(id),
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    recorded_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_location_tracks_attendance ON location_tracks (attendance_id, recorded_at);
CREATE INDEX idx_location_tracks_employee   ON location_tracks (employee_id, recorded_at DESC);
