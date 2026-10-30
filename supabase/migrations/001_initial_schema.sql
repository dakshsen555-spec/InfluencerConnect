-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('business', 'creator')),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator Profiles table
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  niches TEXT[] NOT NULL DEFAULT '{}',
  platforms JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_reach INTEGER NOT NULL DEFAULT 0,
  avg_engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  rate_per_post INTEGER NOT NULL DEFAULT 50,
  barter_accepted BOOLEAN NOT NULL DEFAULT true,
  contact_email TEXT NOT NULL,
  sample_deliverables TEXT[] NOT NULL DEFAULT '{}',
  recent_top_posts JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_description TEXT NOT NULL,
  embedding VECTOR(768),
  rating NUMERIC(3,2) DEFAULT 5.0,
  completed_deals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  tagline TEXT,
  industry TEXT NOT NULL,
  website TEXT,
  location TEXT,
  monthly_budget INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  product_description TEXT NOT NULL,
  target_niches TEXT[] NOT NULL DEFAULT '{}',
  target_platforms TEXT[] NOT NULL DEFAULT '{}',
  target_location TEXT,
  budget_per_deliverable INTEGER NOT NULL,
  deliverables_required TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'in_progress', 'completed')),
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pitches table
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  pitch_subject TEXT NOT NULL,
  pitch_body TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  offered_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'negotiating', 'accepted', 'declined', 'escrow_funded', 'content_submitted', 'completed')),
  content_submission_url TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow Payments table
CREATE TABLE IF NOT EXISTS escrow_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  stripe_payment_id TEXT,
  funded_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

-- pgvector Index for cosine similarity search
CREATE INDEX IF NOT EXISTS creator_embedding_cosine_idx 
ON creator_profiles 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Match function using pgvector cosine distance
CREATE OR REPLACE FUNCTION match_creators_with_vector(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  total_reach INT,
  avg_engagement_rate NUMERIC,
  rate_per_post INT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.username,
    cp.total_reach,
    cp.avg_engagement_rate,
    cp.rate_per_post,
    1 - (cp.embedding <=> query_embedding) AS similarity
  FROM creator_profiles cp
  WHERE 1 - (cp.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
