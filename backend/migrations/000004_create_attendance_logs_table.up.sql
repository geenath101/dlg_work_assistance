CREATE TABLE attendance_logs (
    id           TEXT        PRIMARY KEY,
    site_id      TEXT        NOT NULL REFERENCES sites(id),
    employee_id  TEXT        NOT NULL REFERENCES employees(id),
    sign_in_at   TIMESTAMPTZ NOT NULL,
    sign_out_at  TIMESTAMPTZ,
    sign_in_lat  DOUBLE PRECISION NOT NULL,
    sign_in_lon  DOUBLE PRECISION NOT NULL,
    sign_out_lat DOUBLE PRECISION,
    sign_out_lon DOUBLE PRECISION,
    status       TEXT        NOT NULL DEFAULT 'in_progress'
                             CHECK (status IN ('in_progress', 'completed')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_employee ON attendance_logs (employee_id, sign_in_at DESC);
CREATE INDEX idx_attendance_site     ON attendance_logs (site_id, sign_in_at DESC);
CREATE INDEX idx_attendance_status   ON attendance_logs (status) WHERE status = 'in_progress';
