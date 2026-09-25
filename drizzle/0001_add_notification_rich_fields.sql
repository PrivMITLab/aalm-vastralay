-- 👑 AALM VASTRALAY — ZERO-LOSS MIGRATION
-- Add rich notification fields for Android Push & Modern Notification Feed
-- Strictly additive: ADD COLUMN IF NOT EXISTS with non-destructive defaults

ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'info' NOT NULL;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "channel_id" text DEFAULT 'orders_and_alerts' NOT NULL;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_buttons" jsonb DEFAULT '[]'::jsonb NOT NULL;
