import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── contacts ────────────────────────────────────────────────────────────────

export const contacts = sqliteTable('contacts', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),
  email:       text('email'),
  phone:       text('phone'),
  company:     text('company'),
  source:      text('source').default('otro'),       // LeadSource
  temperature: text('temperature').default('cold'),  // cold | warm | hot
  score:       integer('score').default(0),
  notes:       text('notes'),
  createdAt:   text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt:   text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── pipeline_stages ─────────────────────────────────────────────────────────

export const pipelineStages = sqliteTable('pipeline_stages', {
  id:      text('id').primaryKey(),
  name:    text('name').notNull(),
  order:   integer('order').notNull(),
  color:   text('color').default('#64748b'),
  isWon:   integer('is_won', { mode: 'boolean' }).default(false),
  isLost:  integer('is_lost', { mode: 'boolean' }).default(false),
});

// ─── deals ───────────────────────────────────────────────────────────────────

export const deals = sqliteTable('deals', {
  id:            text('id').primaryKey(),
  title:         text('title').notNull(),
  value:         integer('value').default(0),        // in øre/cents
  stageId:       text('stage_id').references(() => pipelineStages.id),
  contactId:     text('contact_id').references(() => contacts.id),
  expectedClose: text('expected_close'),
  probability:   integer('probability').default(0),  // 0-100
  notes:         text('notes'),
  createdAt:     text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt:     text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── activities ───────────────────────────────────────────────────────────────

export const activities = sqliteTable('activities', {
  id:          text('id').primaryKey(),
  type:        text('type').notNull(), // call | email | meeting | note | follow_up
  description: text('description').notNull(),
  contactId:   text('contact_id').references(() => contacts.id),
  dealId:      text('deal_id').references(() => deals.id),
  scheduledAt: text('scheduled_at'),
  completedAt: text('completed_at'),
  createdAt:   text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── crm_settings ────────────────────────────────────────────────────────────

export const crmSettings = sqliteTable('crm_settings', {
  key:   text('key').primaryKey(),
  value: text('value').notNull(),
});
