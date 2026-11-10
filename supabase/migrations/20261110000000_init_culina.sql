-- ====================================================================
-- CulinaAI Schema Initial Migration
-- Adheres to Supabase Postgres Best Practices & Security Guidelines
-- ====================================================================

-- 1. Recipe Cache Table (Database-backed TTL caching to minimize Spoonacular calls)
CREATE TABLE IF NOT EXISTS public.recipe_cache (
    cache_key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cache expiration cleanup queries
CREATE INDEX IF NOT EXISTS idx_recipe_cache_expires_at ON public.recipe_cache (expires_at);

-- 2. User Favorites Table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id BIGINT NOT NULL,
    recipe_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_recipe UNIQUE (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites (user_id);

-- 3. User Consolidated Grocery Items Table
CREATE TABLE IF NOT EXISTS public.user_grocery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT '',
    aisle TEXT DEFAULT 'Pantry',
    checked BOOLEAN NOT NULL DEFAULT false,
    recipe_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_grocery_items_user_id ON public.user_grocery_items (user_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.recipe_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_grocery_items ENABLE ROW LEVEL SECURITY;

-- Recipe Cache: Read-only for authenticated or anon, writeable only by Edge Function service role
CREATE POLICY "Recipe cache is readable by anyone"
    ON public.recipe_cache
    FOR SELECT
    USING (true);

-- User Favorites Policies
CREATE POLICY "Users can view their own favorites"
    ON public.user_favorites
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON public.user_favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON public.user_favorites
    FOR DELETE
    USING (auth.uid() = user_id);

-- User Grocery Items Policies
CREATE POLICY "Users can view their own grocery items"
    ON public.user_grocery_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grocery items"
    ON public.user_grocery_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grocery items"
    ON public.user_grocery_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grocery items"
    ON public.user_grocery_items
    FOR DELETE
    USING (auth.uid() = user_id);

