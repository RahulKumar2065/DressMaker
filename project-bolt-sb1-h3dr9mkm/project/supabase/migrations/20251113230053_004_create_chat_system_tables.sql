/*
  # Real-Time Chat System Tables

  1. New Tables
    - `conversations` - Chat conversations between customers and tailors
    - `messages` - Individual messages in conversations
  
  2. Security
    - Enable RLS on all tables
    - Only conversation participants can view/send messages
    - Messages are ordered by timestamp

  3. Description
    - conversations: Link between customer and tailor
    - messages: Individual chat messages with timestamps
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, tailor_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'tailor')),
  content text NOT NULL,
  attachment_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Customers can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = conversations.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Tailors can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = conversations.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = conversations.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = conversations.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = conversations.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = conversations.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        (EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE customer_profiles.id = conversations.customer_id
          AND customer_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM tailor_profiles
          WHERE tailor_profiles.id = conversations.tailor_id
          AND tailor_profiles.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Participants can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (
        (EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE customer_profiles.id = conversations.customer_id
          AND customer_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM tailor_profiles
          WHERE tailor_profiles.id = conversations.tailor_id
          AND tailor_profiles.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Create indexes
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_tailor_id ON conversations(tailor_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
