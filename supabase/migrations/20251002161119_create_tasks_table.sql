/*
  # Create tasks table for Chrome extension

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `text` (text) - Task description
      - `completed` (boolean) - Whether the task is completed
      - `created_at` (timestamptz) - When the task was created
      - `updated_at` (timestamptz) - When the task was last updated
      - `user_id` (text) - Browser identifier for the user (since no auth)
      - `position` (integer) - Order of tasks for display

  2. Security
    - Enable RLS on `tasks` table
    - Add policy for users to manage their own tasks based on user_id
    
  3. Indexes
    - Index on user_id and position for efficient querying
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id text NOT NULL,
  position integer DEFAULT 0
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

CREATE INDEX IF NOT EXISTS idx_tasks_user_position ON tasks(user_id, position);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();