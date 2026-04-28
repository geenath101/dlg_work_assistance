CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE sites (
    id                 TEXT        PRIMARY KEY,
    name               TEXT        NOT NULL,
    address            TEXT        NOT NULL,
    latitude           DOUBLE PRECISION NOT NULL,
    longitude          DOUBLE PRECISION NOT NULL,
    proximity_radius_m INTEGER     NOT NULL DEFAULT 100,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sites_location ON sites (latitude, longitude);
