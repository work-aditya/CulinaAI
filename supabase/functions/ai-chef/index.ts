import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Production Curated Culinary Fallback Catalog
const FALLBACK_RECIPES = [
  {
    id: 716429,
    title: 'Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281294?auto=format&fit=crop&w=800&q=80',
    summary: 'A vibrant Mediterranean pasta tossed with tender caramelized cauliflower florets, fragrant garlic, toasted golden breadcrumbs, and a kick of red pepper flakes.',
    readyInMinutes: 30,
    servings: 4,
    calories: 485,
    protein: '14g',
    carbs: '72g',
    fat: '16g',
    diets: ['vegetarian'],
    cuisines: ['Mediterranean', 'Italian'],
    extendedIngredients: [
      { id: 1, name: 'Rigatoni or Penne pasta', amount: 350, unit: 'g', original: '350g rigatoni pasta', aisle: 'Pasta and Rice' },
      { id: 2, name: 'Cauliflower', amount: 1, unit: 'head', original: '1 medium head cauliflower, cut into florets', aisle: 'Produce' },
      { id: 3, name: 'Garlic', amount: 5, unit: 'cloves', original: '5 cloves garlic, thinly sliced', aisle: 'Produce' },
      { id: 4, name: 'Scallions', amount: 4, unit: 'stalks', original: '4 scallions, chopped', aisle: 'Produce' },
      { id: 5, name: 'Panko breadcrumbs', amount: 0.5, unit: 'cup', original: '1/2 cup panko breadcrumbs, toasted', aisle: 'Bakery/Bread' },
      { id: 6, name: 'Extra virgin olive oil', amount: 3, unit: 'tbsp', original: '3 tbsp extra virgin olive oil', aisle: 'Oil, Vinegar, Salad Dressing' },
      { id: 7, name: 'Parmigiano-Reggiano', amount: 0.25, unit: 'cup', original: '1/4 cup freshly grated Parmigiano-Reggiano', aisle: 'Cheese' },
    ],
    analyzedInstructions: [
      { number: 1, step: 'Blanch cauliflower florets in boiling salted water for 3 mins until just tender.' },
      { number: 2, step: 'Cook pasta in the same water until al dente, reserving 1/2 cup pasta water.' },
      { number: 3, step: 'Heat olive oil in a skillet, sauté sliced garlic until fragrant, then caramelize cauliflower.' },
      { number: 4, step: 'Toss pasta into skillet with reserved water, Parmigiano, and toasted breadcrumbs.' },
    ],
  },
  {
    id: 715538,
    title: 'Pan-Seared Citrus Salmon with Avocado Herb Salad',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    summary: 'Crispy skin salmon fillets resting on a bed of fresh baby spinach, Haas avocado slices, cucumber ribbons, and a Meyer lemon dill vinaigrette.',
    readyInMinutes: 25,
    servings: 2,
    calories: 520,
    protein: '38g',
    carbs: '11g',
    fat: '36g',
    diets: ['gluten free', 'ketogenic', 'pescetarian'],
    cuisines: ['Nordic', 'American'],
    extendedIngredients: [
      { id: 10, name: 'Wild Salmon Fillets', amount: 2, unit: 'fillets', original: '2 skin-on salmon fillets (180g each)', aisle: 'Seafood' },
      { id: 11, name: 'Haas Avocado', amount: 1, unit: 'whole', original: '1 ripe avocado, diced', aisle: 'Produce' },
      { id: 12, name: 'Baby Spinach', amount: 4, unit: 'cups', original: '4 cups tender baby spinach leaves', aisle: 'Produce' },
      { id: 13, name: 'English Cucumber', amount: 1, unit: 'cup', original: '1 cup shaved cucumber ribbons', aisle: 'Produce' },
      { id: 14, name: 'Meyer Lemon Juice', amount: 2, unit: 'tbsp', original: '2 tbsp fresh lemon juice', aisle: 'Produce' },
      { id: 15, name: 'Olive Oil', amount: 2, unit: 'tbsp', original: '2 tbsp extra virgin olive oil', aisle: 'Oil, Vinegar, Salad Dressing' },
    ],
    analyzedInstructions: [
      { number: 1, step: 'Pat salmon fillets dry with paper towels; score skin lightly and season with sea salt.' },
      { number: 2, step: 'Heat olive oil in stainless or cast-iron skillet over medium-high heat until shimmering.' },
      { number: 3, step: 'Press salmon skin-side down for 5-6 minutes until ultra crispy; flip and finish for 2 mins.' },
      { number: 4, step: 'Toss baby spinach, cucumber, and avocado with fresh lemon dill vinaigrette.' },
    ],
  },
  {
    id: 716381,
    title: 'Warm Quinoa & Roasted Sweet Potato Power Bowl',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    summary: 'Fluffy rainbow quinoa paired with caramelized roasted sweet potato cubes, tender spiced chickpeas, massaged kale, and a velvety tahini lemon drizzle.',
    readyInMinutes: 35,
    servings: 3,
    calories: 440,
    protein: '16g',
    carbs: '68g',
    fat: '14g',
    diets: ['vegan', 'vegetarian', 'gluten free', 'dairy free'],
    cuisines: ['Mediterranean', 'Middle Eastern'],
    extendedIngredients: [
      { id: 20, name: 'Rainbow Quinoa', amount: 1, unit: 'cup', original: '1 cup rinsed quinoa', aisle: 'Pasta and Rice' },
      { id: 21, name: 'Sweet Potato', amount: 2, unit: 'medium', original: '2 sweet potatoes, cubed', aisle: 'Produce' },
      { id: 22, name: 'Cooked Chickpeas', amount: 1, unit: 'can', original: '1 can (400g) chickpeas, rinsed and dried', aisle: 'Canned and Jarred' },
      { id: 23, name: 'Curly Kale', amount: 3, unit: 'cups', original: '3 cups shredded kale leaves', aisle: 'Produce' },
      { id: 24, name: 'Tahini', amount: 3, unit: 'tbsp', original: '3 tbsp roasted sesame tahini', aisle: 'Condiments' },
    ],
    analyzedInstructions: [
      { number: 1, step: 'Preheat oven to 200°C (400°F). Toss sweet potatoes and chickpeas with cumin, paprika, and olive oil.' },
      { number: 2, step: 'Roast for 25 minutes until caramelized on edges and chickpeas are lightly crisp.' },
      { number: 3, step: 'Simmer rinsed quinoa in 2 cups water for 15 minutes until germ separates; fluff with fork.' },
      { number: 4, step: 'Whisk tahini, lemon juice, garlic, and warm water into a smooth drizzle.' },
      { number: 5, step: 'Assemble bowls with quinoa, kale, roasted vegetables, and tahini dressing.' },
    ],
  },
  {
    id: 716268,
    title: 'Thai Red Curry with Tofu, Coconut Milk & Thai Basil',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
    summary: 'A soul-warming Thai red curry infused with creamy coconut milk, crispy pressed tofu cubes, bamboo shoots, red bell peppers, and fragrant fresh Thai holy basil.',
    readyInMinutes: 30,
    servings: 4,
    calories: 495,
    protein: '18g',
    carbs: '24g',
    fat: '38g',
    diets: ['vegan', 'vegetarian', 'gluten free', 'dairy free'],
    cuisines: ['Thai', 'Asian'],
    extendedIngredients: [
      { id: 30, name: 'Extra Firm Tofu', amount: 400, unit: 'g', original: '400g firm tofu, pressed and cubed', aisle: 'Produce' },
      { id: 31, name: 'Full-fat Coconut Milk', amount: 1, unit: 'can', original: '1 can (400ml) coconut milk', aisle: 'Canned and Jarred' },
      { id: 32, name: 'Thai Red Curry Paste', amount: 3, unit: 'tbsp', original: '3 tbsp authentic red curry paste', aisle: 'Ethnic Foods' },
      { id: 33, name: 'Red Bell Pepper', amount: 1, unit: 'large', original: '1 bell pepper, sliced', aisle: 'Produce' },
      { id: 34, name: 'Fresh Thai Basil', amount: 0.5, unit: 'cup', original: '1/2 cup fresh Thai basil leaves', aisle: 'Produce' },
    ],
    analyzedInstructions: [
      { number: 1, step: 'Sear pressed tofu cubes in coconut oil until golden and crisp on all sides (8 mins).' },
      { number: 2, step: 'In a saucepan, fry red curry paste in 2 tbsp coconut cream until aromatic oil splits (2 mins).' },
      { number: 3, step: 'Pour in remaining coconut milk and simmer with sliced bell peppers and bamboo shoots.' },
      { number: 4, step: 'Fold in crisped tofu, season with tamari and palm sugar, and stir in fresh basil off heat.' },
    ],
  },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Supabase secrets.')
    }

    const { prompt = '', history = [], dietaryFilters = {} } = await req.json()
    if (!prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Optional user verification from Auth header
    const authHeader = req.headers.get('Authorization')
    let userGreeting = 'Chef'
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user?.email) {
          userGreeting = user.email.split('@')[0] || 'Chef'
        }
      } catch {
        // Fallback gracefully
      }
    }

    // 1. Generate text embedding for user prompt via OpenAI text-embedding-3-small
    let rawRetrieved: any[] = []

    try {
      const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: prompt.trim(),
        }),
      })

      if (embeddingRes.ok) {
        const embeddingData = await embeddingRes.json()
        const queryEmbedding = embeddingData.data?.[0]?.embedding

        // 2. Query pgvector semantic similarity via RPC match_recipes
        if (queryEmbedding && queryEmbedding.length > 0) {
          const { data: matched, error: matchError } = await supabase.rpc('match_recipes', {
            query_embedding: queryEmbedding,
            match_threshold: 0.10,
            match_count: 3,
          })

          if (!matchError && matched && matched.length > 0) {
            rawRetrieved = matched
          }
        }
      }
    } catch {
      // Embedding failure fallback to database text query
    }

    // If RAG query returned no results, query standard recipes table
    if (rawRetrieved.length === 0) {
      try {
        const { data: dbRecipes } = await supabase
          .from('recipes')
          .select('*')
          .limit(3)

        if (dbRecipes && dbRecipes.length > 0) {
          rawRetrieved = dbRecipes
        }
      } catch {
        // Fallback to embedded catalog
      }
    }

    // If still empty, use the rich culinary catalog
    if (rawRetrieved.length === 0) {
      // Select best matching fallback recipes based on simple keyword search
      const q = prompt.toLowerCase()
      const filtered = FALLBACK_RECIPES.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.diets.some((d) => q.includes(d)) ||
        r.cuisines.some((c) => q.includes(c.toLowerCase()))
      )
      rawRetrieved = filtered.length > 0 ? filtered : FALLBACK_RECIPES.slice(0, 2)
    }

    // 3. Normalize into frontend camelCase Recipe structure
    const suggestedRecipes = rawRetrieved.map((r: any) => ({
      id: r.id,
      title: r.title,
      image: r.image || r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      summary: r.summary || '',
      readyInMinutes: r.ready_in_minutes ?? r.readyInMinutes ?? 30,
      servings: r.servings ?? 4,
      calories: r.calories ?? 450,
      protein: r.protein || undefined,
      carbs: r.carbs || undefined,
      fat: r.fat || undefined,
      diets: r.diets || [],
      cuisines: r.cuisines || [],
      extendedIngredients: r.extended_ingredients || r.extendedIngredients || [],
      analyzedInstructions: r.analyzed_instructions || r.analyzedInstructions || [],
      matchReason: r.match_reason || `Curated for your "${prompt}" craving.`,
    }))

    // 4. Build Recipe Context for LLM
    const recipeContext = suggestedRecipes
      .map((r, i) =>
        `Recommendation ${i + 1}: "${r.title}"
• Time: ${r.readyInMinutes} minutes | Calories: ${r.calories} kcal
• Diets: ${r.diets.join(', ') || 'Standard'}
• Key Ingredients: ${r.extendedIngredients.slice(0, 5).map((ing: any) => ing.name).join(', ')}
• Summary: ${r.summary}`
      )
      .join('\n\n')

    // 5. System Prompt — Production Grade Michelin Sous Chef
    const systemPrompt = `You are Chef Culina, an elite Michelin-trained culinary director and passionate nutritionist at CulinaAI.
Your mission is to guide home chefs with elegance, warmth, and precision.

RESPONSE GUIDELINES:
1. Greet the user naturally (addressed as ${userGreeting}).
2. Directly answer their craving, dietary goal, or available ingredients.
3. Reference the recommended recipes below by title, explaining exactly WHY the flavor profile, timing, or nutrition fits their request.
4. Provide ONE "Chef's Secret Pro-Tip" (e.g. pan sear technique, seasoning balance, blooming spices, resting meat, or pasta emulsion).
5. Suggest one easy substitution if they are missing a pantry item.
6. Keep the response organized with clear paragraphs or clean bullet points. Maintain a concise, uplifting tone (around 150-220 words) perfectly suited for a chat drawer.

RECOMMENDED RECIPE DATA IN CONTEXT:
${recipeContext}`

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      })),
      { role: 'user', content: prompt },
    ]

    // 6. Call OpenAI GPT-4o-mini for production completion
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 450,
        temperature: 0.7,
      }),
    })

    let aiMessage = `Hello ${userGreeting}! Based on your craving, I've curated the perfect culinary match for you below. Take a look at the recipe steps, and let me know if you need any ingredient adjustments!`

    if (chatRes.ok) {
      const chatData = await chatRes.json()
      aiMessage = chatData.choices?.[0]?.message?.content?.trim() || aiMessage
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        suggestedRecipes,
        user: userGreeting,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
