-- JAN-SETU AI Relational Schema (SQLite Compatible)

CREATE TABLE IF NOT EXISTS districts (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  population INTEGER NOT NULL,
  population_source TEXT NOT NULL,
  population_as_of TEXT NOT NULL,
  population_confidence TEXT NOT NULL,
  bpl_pct REAL NOT NULL,
  bpl_pct_source TEXT NOT NULL,
  bpl_pct_as_of TEXT NOT NULL,
  bpl_pct_confidence TEXT NOT NULL,
  infra_deficit_score REAL NOT NULL,
  infra_deficit_source TEXT NOT NULL,
  infra_deficit_as_of TEXT NOT NULL,
  infra_deficit_confidence TEXT NOT NULL,
  existing_budget_allocation REAL NOT NULL,
  budget_source TEXT NOT NULL,
  budget_as_of TEXT NOT NULL,
  budget_confidence TEXT NOT NULL,
  estimated_reporting_capture_rate REAL NOT NULL,
  capture_rate_source TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS district_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  district_code TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  indicator_value REAL NOT NULL,
  source TEXT NOT NULL,
  as_of TEXT NOT NULL,
  confidence TEXT NOT NULL,
  requires_review INTEGER DEFAULT 0,
  FOREIGN KEY (district_code) REFERENCES districts(code)
);

CREATE TABLE IF NOT EXISTS citizens (
  id TEXT PRIMARY KEY,
  telegram_handle TEXT NOT NULL,
  created_at TEXT NOT NULL,
  account_age_hours REAL DEFAULT 24.0
);

CREATE TABLE IF NOT EXISTS demand_clusters (
  id TEXT PRIMARY KEY,
  problem_title TEXT NOT NULL,
  problem_summary TEXT NOT NULL,
  district_code TEXT NOT NULL,
  category TEXT NOT NULL,
  citizens_affected INTEGER DEFAULT 1,
  urgency REAL DEFAULT 0.5,
  priority_score REAL DEFAULT 0.0,
  score_breakdown TEXT,
  score_explanation TEXT,
  has_self_extracted_data INTEGER DEFAULT 0,
  review_status TEXT DEFAULT 'pending',
  funding_status TEXT DEFAULT 'unfunded',
  funded_amount REAL DEFAULT 0,
  funded_at TEXT,
  verification_status TEXT DEFAULT 'not_started',
  approx_location TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (district_code) REFERENCES districts(code)
);

CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  citizen_id TEXT NOT NULL,
  district_code TEXT NOT NULL,
  cluster_id TEXT,
  channel TEXT DEFAULT 'Telegram',
  language TEXT NOT NULL,
  audio_url TEXT,
  original_transcript TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency REAL DEFAULT 0.5,
  approx_lat REAL,
  approx_lng REAL,
  geo_hash TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id),
  FOREIGN KEY (district_code) REFERENCES districts(code),
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id)
);

CREATE TABLE IF NOT EXISTS cluster_members (
  cluster_id TEXT NOT NULL,
  complaint_id TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (cluster_id, complaint_id),
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);

CREATE TABLE IF NOT EXISTS review_flags (
  id TEXT PRIMARY KEY,
  cluster_id TEXT,
  complaint_id TEXT,
  flag_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority_score REAL DEFAULT 0.0,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);

CREATE TABLE IF NOT EXISTS funding_actions (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL,
  amount REAL NOT NULL,
  funded_by TEXT NOT NULL,
  notes TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id)
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL,
  required_quorum INTEGER NOT NULL,
  confirmations_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id)
);

CREATE TABLE IF NOT EXISTS verification_replies (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  citizen_id TEXT NOT NULL,
  response TEXT NOT NULL,
  comments TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES verification_requests(id),
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id),
  FOREIGN KEY (citizen_id) REFERENCES citizens(id)
);

CREATE TABLE IF NOT EXISTS evidence_photos (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL,
  citizen_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  human_review_status TEXT DEFAULT 'pending',
  reviewer_notes TEXT,
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id),
  FOREIGN KEY (citizen_id) REFERENCES citizens(id)
);

CREATE TABLE IF NOT EXISTS policy_briefs (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  numeric_validation_passed INTEGER DEFAULT 1,
  generated_at TEXT NOT NULL,
  FOREIGN KEY (cluster_id) REFERENCES demand_clusters(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  cluster_id TEXT,
  description TEXT NOT NULL,
  metadata_json TEXT,
  timestamp TEXT NOT NULL
);
