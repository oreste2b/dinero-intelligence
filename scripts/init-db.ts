import { db } from '../lib/db/index';
import { contacts, pipelineStages, deals, activities, crmSettings } from '../lib/db/schema';
import { seedStages, seedDemo } from '../lib/db/seed';
import { sql } from 'drizzle-orm';

// Create tables via raw SQL (drizzle-kit push is the normal flow, this is for runtime init)
const sqlite = (db as any).session.client;

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT DEFAULT 'otro',
    temperature TEXT DEFAULT 'cold',
    score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pipeline_stages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    color TEXT DEFAULT '#64748b',
    is_won INTEGER DEFAULT 0,
    is_lost INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    value INTEGER DEFAULT 0,
    stage_id TEXT REFERENCES pipeline_stages(id),
    contact_id TEXT REFERENCES contacts(id),
    expected_close TEXT,
    probability INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_id TEXT REFERENCES contacts(id),
    deal_id TEXT REFERENCES deals(id),
    scheduled_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS crm_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const withSeed = process.argv.includes('--seed');
if (withSeed) {
  seedDemo();
  console.log('Database initialised with demo data.');
} else {
  seedStages();
  console.log('Database initialised (default pipeline stages only).');
}
