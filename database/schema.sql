CREATE TABLE IF NOT EXISTS schema_versions (version INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS settings (name TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS research (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL,
 voice TEXT NOT NULL CHECK(voice IN ('indigena','nao-indigena','coautoria','institucional')),
 people TEXT NOT NULL, region TEXT NOT NULL, period TEXT NOT NULL,
 topic TEXT NOT NULL, year INTEGER, summary TEXT NOT NULL, url TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft','published'))
);
CREATE TABLE IF NOT EXISTS territories (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, people TEXT NOT NULL, region TEXT NOT NULL,
 description TEXT NOT NULL, source_url TEXT NOT NULL, official_status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS territory_snapshots (
 id TEXT PRIMARY KEY, territory_id TEXT NOT NULL REFERENCES territories(id),
 valid_from INTEGER NOT NULL, valid_to INTEGER NOT NULL,
 source_date TEXT NOT NULL, retrieved_at TEXT NOT NULL, source_url TEXT NOT NULL,
 geometry TEXT NOT NULL, CHECK(valid_to >= valid_from),
 UNIQUE(territory_id, valid_from, valid_to)
);
CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('research','correction','contact')),
 name TEXT NOT NULL, email TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
 voice TEXT NOT NULL, voice_consent INTEGER NOT NULL DEFAULT 0,
 reference_url TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending',
 terms_version TEXT NOT NULL, created_at TEXT NOT NULL, reviewed_at TEXT,
 signature_verified_at TEXT, reviewer_note TEXT
);
CREATE TABLE IF NOT EXISTS attachments (
 id TEXT PRIMARY KEY, submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
 kind TEXT NOT NULL, stored_name TEXT NOT NULL UNIQUE, bytes INTEGER NOT NULL,
 sha256 TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT NOT NULL, bucket INTEGER NOT NULL, attempts INTEGER NOT NULL,
 PRIMARY KEY(key,bucket)
);
CREATE INDEX IF NOT EXISTS snapshots_period ON territory_snapshots(valid_from,valid_to);
CREATE INDEX IF NOT EXISTS submissions_date ON submissions(created_at);
