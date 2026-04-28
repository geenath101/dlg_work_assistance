CREATE TABLE site_assignments (
    id          TEXT        PRIMARY KEY,
    site_id     TEXT        NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    employee_id TEXT        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active      BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_site_assignments_site     ON site_assignments (site_id, active);
CREATE INDEX idx_site_assignments_employee ON site_assignments (employee_id, active);
