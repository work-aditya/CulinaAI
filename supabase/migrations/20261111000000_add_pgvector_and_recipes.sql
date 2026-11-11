-- ====================================================================
-- CulinaAI pgvector & Recipe Embedding Migration
-- Enables vector search (RAG) and stores semantic embeddings
-- ====================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Recipes Table with Vector Embedding (1536 dims for text-embedding-3-small)
CREATE TABLE IF NOT EXISTS public.recipes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    image TEXT,
    ready_in_minutes INTEGER NOT NULL DEFAULT 30,
    servings INTEGER NOT NULL DEFAULT 4,
    calories INTEGER,
    protein TEXT,
    carbs TEXT,
    fat TEXT,
    diets TEXT[] DEFAULT '{}',
    cuisines TEXT[] DEFAULT '{}',
    extended_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    analyzed_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. HNSW Index for cosine similarity vector search
CREATE INDEX IF NOT EXISTS idx_recipes_embedding 
    ON public.recipes 
    USING hnsw (embedding vector_cosine_ops);

-- 4. RAG Match Recipes RPC Function
CREATE OR REPLACE FUNCTION public.match_recipes (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 4
)
RETURNS TABLE (
  id bigint,
  title text,
  summary text,
  image text,
  ready_in_minutes integer,
  servings integer,
  calories integer,
  protein text,
  carbs text,
  fat text,
  diets text[],
  cuisines text[],
  extended_ingredients jsonb,
  analyzed_instructions jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.summary,
    r.image,
    r.ready_in_minutes,
    r.servings,
    r.calories,
    r.protein,
    r.carbs,
    r.fat,
    r.diets,
    r.cuisines,
    r.extended_ingredients,
    r.analyzed_instructions,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM public.recipes r
  WHERE 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are viewable by anyone"
    ON public.recipes
    FOR SELECT
    USING (true);

