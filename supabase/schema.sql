-- ====================================================================
-- CulinaAI Complete Cloud Database Schema
-- Ready to run directly in the Supabase Dashboard SQL Editor
-- Project Ref: ueqjnjvbdjjnxzkosphj
-- ====================================================================

-- 1. Enable pgvector extension for AI semantic search (RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Recipes Table (with pgvector embeddings)
CREATE TABLE IF NOT EXISTS public.recipes (
    id BIGINT PRIMARY KEY,
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
    match_reason TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW cosine index for sub-millisecond vector similarity search
CREATE INDEX IF NOT EXISTS idx_recipes_embedding 
    ON public.recipes 
    USING hnsw (embedding vector_cosine_ops);

-- 3. RAG Semantic Search RPC Function (Cosine Distance)
CREATE OR REPLACE FUNCTION public.match_recipes (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.15,
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
  WHERE r.embedding IS NOT NULL AND (1 - (r.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 4. Recipe Cache Table (Minimizes Spoonacular API usage with TTL expiration)
CREATE TABLE IF NOT EXISTS public.recipe_cache (
    cache_key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipe_cache_expires_at ON public.recipe_cache (expires_at);

-- 5. User Favorites Table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id BIGINT NOT NULL,
    recipe_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_recipe UNIQUE (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites (user_id);

-- 6. User Consolidated Grocery Items Table
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

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_grocery_items ENABLE ROW LEVEL SECURITY;

-- Recipes are publicly readable
DROP POLICY IF EXISTS "Recipes are viewable by everyone" ON public.recipes;
CREATE POLICY "Recipes are viewable by everyone"
    ON public.recipes FOR SELECT USING (true);

-- Cache is readable by anyone
DROP POLICY IF EXISTS "Recipe cache is readable by anyone" ON public.recipe_cache;
CREATE POLICY "Recipe cache is readable by anyone"
    ON public.recipe_cache FOR SELECT USING (true);

-- User Favorites Policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
CREATE POLICY "Users can view their own favorites"
    ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
CREATE POLICY "Users can insert their own favorites"
    ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete their own favorites"
    ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- User Grocery Items Policies
DROP POLICY IF EXISTS "Users can view their own grocery items" ON public.user_grocery_items;
CREATE POLICY "Users can view their own grocery items"
    ON public.user_grocery_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own grocery items" ON public.user_grocery_items;
CREATE POLICY "Users can insert their own grocery items"
    ON public.user_grocery_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own grocery items" ON public.user_grocery_items;
CREATE POLICY "Users can update their own grocery items"
    ON public.user_grocery_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own grocery items" ON public.user_grocery_items;
CREATE POLICY "Users can delete their own grocery items"
    ON public.user_grocery_items FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- SEED INITIAL 12 VERIFIED RECIPES
-- ====================================================================

INSERT INTO public.recipes (id, title, summary, image, ready_in_minutes, servings, calories, protein, carbs, fat, diets, cuisines)
VALUES
(716429, 'Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs', 'A vibrant Mediterranean pasta tossed with tender caramelized cauliflower florets, fragrant garlic, and toasted golden breadcrumbs.', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281294?auto=format&fit=crop&w=800&q=80', 30, 4, 485, '14g', '72g', '16g', ARRAY['vegetarian'], ARRAY['Mediterranean', 'Italian']),
(715538, 'Pan-Seared Citrus Salmon with Avocado Herb Salad', 'Crispy skin salmon fillets resting on a bed of fresh baby spinach, Haas avocado slices, cucumber ribbons, and a Meyer lemon dill vinaigrette.', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', 25, 2, 520, '38g', '11g', '36g', ARRAY['gluten free', 'ketogenic', 'pescetarian'], ARRAY['Nordic', 'American']),
(649495, 'Roasted Sweet Potato & Chickpea Tahini Buddha Bowl', 'Spiced cumin sweet potatoes, crispy roasted chickpeas, tender massaged kale, and pickled red onions topped with creamy lemon-tahini drizzle.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 35, 2, 440, '15g', '64g', '16g', ARRAY['vegan', 'vegetarian', 'gluten free', 'dairy free'], ARRAY['Middle Eastern']),
(715415, 'Red Lentil Coconut Curry with Steamed Basmati', 'Comforting turmeric red lentils simmered in rich coconut milk, fresh ginger, vine tomatoes, and baby spinach served alongside fragrant basmati rice.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 30, 4, 395, '16g', '58g', '11g', ARRAY['vegan', 'vegetarian', 'gluten free', 'dairy free'], ARRAY['Indian']),
(820101, 'North African Shakshuka with Poached Eggs & Feta', 'Pasture-raised eggs gently poached in a rich spiced tomato, sweet bell pepper, and smoked paprika sauce, topped with crumbled feta.', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80', 20, 3, 320, '17g', '22g', '19g', ARRAY['vegetarian', 'gluten free'], ARRAY['Mediterranean', 'Middle Eastern']),
(820102, 'Creamy Tuscan Garlic Chicken with Sun-Dried Tomatoes', 'Golden pan-seared chicken cutlets bathed in a silky garlic parmesan cream sauce loaded with tangy sun-dried tomatoes and tender baby spinach.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', 25, 4, 490, '42g', '8g', '32g', ARRAY['gluten free', 'ketogenic'], ARRAY['Italian']),
(820103, 'Thai Holy Basil Stir-Fry (Pad Krapow Beef)', 'Minced beef flash-fried in a fiery wok with garlic, bird’s eye chilies, shallots, and fresh holy basil, topped with a crispy fried egg.', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80', 18, 2, 520, '36g', '38g', '24g', ARRAY['dairy free'], ARRAY['Thai', 'Asian']),
(820104, 'Japanese Golden Katsu Curry Bowl', 'Ultra-crispy panko breaded cutlet served over steamed rice and smothered in a velvety, caramelized spiced Japanese onion curry sauce.', 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', 35, 4, 610, '34g', '68g', '22g', ARRAY['dairy free'], ARRAY['Japanese', 'Asian']),
(820105, 'Baja Crispy Fish Tacos with Chipotle Lime Crema', 'Lightly battered Pacific whitefish cradled in warm corn tortillas with shredded purple cabbage slaw and smoky chipotle crema.', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80', 25, 3, 410, '28g', '44g', '14g', ARRAY['pescetarian'], ARRAY['Mexican']),
(820106, 'Miso Glazed Eggplant & Shiitake Soba Noodle Bowl', 'Nutty buckwheat soba noodles topped with caramelized sweet white miso Japanese eggplant, pan-crisped shiitake mushrooms, and toasted sesame.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', 25, 2, 385, '16g', '62g', '9g', ARRAY['vegan', 'vegetarian', 'dairy free'], ARRAY['Japanese', 'Asian']),
(820107, 'Greek Lemon Herb Chicken with Crispy Oregano Potatoes', 'Tender bone-in chicken thighs roasted with Yukon gold potato wedges in a bath of Greek olive oil, fresh lemon juice, garlic, and wild oregano.', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', 40, 4, 540, '40g', '28g', '29g', ARRAY['gluten free', 'dairy free'], ARRAY['Greek', 'Mediterranean']),
(820108, 'Creamy Wild Mushroom & Truffle Risotto', 'Creamy Arborio rice slowly simmered with golden chanterelles, cremini mushrooms, dry white wine, shallots, Parmigiano-Reggiano, and truffle oil.', 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80', 30, 4, 460, '12g', '65g', '16g', ARRAY['vegetarian', 'gluten free'], ARRAY['Italian'])
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    calories = EXCLUDED.calories,
    protein = EXCLUDED.protein;

