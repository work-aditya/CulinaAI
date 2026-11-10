// Follow Deno and Supabase Edge Function guidelines
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query = '', mode = 'description', filters = {}, ingredients = [] } = await req.json()

    // Initialize Supabase admin client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const spoonacularApiKey = Deno.env.get('SPOONACULAR_API_KEY') ?? ''
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Construct Cache Key
    const cacheKey = `search:${mode}:${query.trim().toLowerCase()}:${ingredients.sort().join(',')}:${filters.diet || ''}:${filters.maxCalories || ''}`

    // Check Postgres cache first
    const { data: cached } = await supabase
      .from('recipe_cache')
      .select('data, expires_at')
      .eq('cache_key', cacheKey)
      .maybeSingle()

    if (cached && new Date(cached.expires_at) > new Date()) {
      return new Response(JSON.stringify({ recipes: cached.data, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let recipes: any[] = []

    // If Spoonacular API key is provided, query the real Spoonacular API
    if (spoonacularApiKey) {
      let spoonacularUrl = ''

      if (mode === 'ingredients' && ingredients.length > 0) {
        spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
          ingredients.join(',')
        )}&number=8&ranking=2&ignorePantry=true&apiKey=${spoonacularApiKey}`
      } else {
        const queryParams = new URLSearchParams({
          apiKey: spoonacularApiKey,
          query: query,
          number: '8',
          addRecipeInformation: 'true',
          addRecipeNutrition: 'true',
          fillIngredients: 'true',
        })

        if (filters.diet) queryParams.set('diet', filters.diet)
        if (filters.maxCalories) queryParams.set('maxCalories', String(filters.maxCalories))
        if (filters.maxReadyTime) queryParams.set('maxReadyTime', String(filters.maxReadyTime))

        spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?${queryParams.toString()}`
      }

      const res = await fetch(spoonacularUrl)
      if (res.ok) {
        const apiData = await res.json()
        const rawList = Array.isArray(apiData) ? apiData : apiData.results || []

        recipes = rawList.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          summary: item.summary ? item.summary.replace(/<[^>]*>?/gm, '') : '',
          readyInMinutes: item.readyInMinutes || 30,
          servings: item.servings || 4,
          calories: item.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || null,
          protein: item.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount + 'g' || null,
          carbs: item.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount + 'g' || null,
          fat: item.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount + 'g' || null,
          diets: item.diets || [],
          cuisines: item.cuisines || [],
          extendedIngredients: (item.extendedIngredients || []).map((ing: any) => ({
            id: ing.id,
            name: ing.nameClean || ing.name,
            amount: ing.amount,
            unit: ing.unit,
            original: ing.original,
            aisle: ing.aisle || 'Pantry',
          })),
          analyzedInstructions: (item.analyzedInstructions?.[0]?.steps || []).map((s: any) => ({
            number: s.number,
            step: s.step,
          })),
        }))
      }
    }

    // AI Recipe Intent Interpretation (OpenAI) when natural language query is provided
    if (openaiApiKey && query && recipes.length > 0) {
      try {
        const aiPrompt = `User searched for: "${query}". Provide a 1-sentence explanation of why these recipes match the user's intent.`
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: aiPrompt }],
            max_tokens: 100,
          }),
        })

        if (aiRes.ok) {
          const aiJson = await aiRes.json()
          const explanation = aiJson.choices?.[0]?.message?.content?.trim()
          if (explanation) {
            recipes.forEach((r) => {
              r.matchReason = explanation
            })
          }
        }
      } catch {
        // Continue even if AI call fails
      }
    }

    // Cache the result in Postgres for 24 hours if we have recipes
    if (recipes.length > 0 && supabaseUrl && supabaseServiceKey) {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('recipe_cache').upsert({
        cache_key: cacheKey,
        data: recipes,
        expires_at: expiresAt,
      })
    }

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

