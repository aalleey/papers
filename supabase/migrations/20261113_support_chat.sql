-- Live Support Chat Conversations & Messages
CREATE TABLE IF NOT EXISTS public.support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_token TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL DEFAULT 'Guest Educator',
  user_email TEXT,
  user_phone TEXT,
  subject TEXT NOT NULL DEFAULT 'General Support',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  unread_by_admin INTEGER NOT NULL DEFAULT 0,
  unread_by_user INTEGER NOT NULL DEFAULT 0,
  last_message_preview TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_conversations_visitor
  ON public.support_conversations(visitor_token, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_conversations_status
  ON public.support_conversations(status, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin', 'system')),
  sender_name TEXT NOT NULL DEFAULT 'Support',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_conv
  ON public.support_messages(conversation_id, created_at ASC);
