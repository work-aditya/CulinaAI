import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    let userEmail = 'Guest Chef'
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user?.email) userEmail = user.email
    }

    // 1. Generate text embedding for user prompt via OpenAI text-embedding-3-small
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

    let retrievedRecipes: any[] = []

    if (embeddingRes.ok) {
      const embeddingData = await embeddingRes.json()
      const queryEmbedding = embeddingData.data?.[0]?.embedding

      // 2. Query pgvector semantic similarity via RPC match_recipes
      if (queryEmbedding && queryEmbedding.length > 0) {
        const { data: matched, error: matchError } = await supabase.rpc('match_recipes', {
          query_embedding: queryEmbedding,
          match_threshold: 0.15,
          match_count: 3,
        })

        if (!matchError && matched && matched.length > 0) {
          retrievedRecipes = matched
        }
      }
    }

    // 3. Construct RAG Context from retrieved recipes (or fallback to structured query)
    const recipeContext = retrievedRecipes.map((r, i) => 
      `Recipe ${i + 1}: "${r.title}" (${r.ready_in_minutes} mins, ${r.calories} kcal). Diets: ${r.diets?.join(', ')}. Ingredients: ${
        r.extended_ingredients?.map((ing: any) => ing.name).join(', ')
      }. Summary: ${r.summary}`
    ).join('\n\n')

    // 4. Generate AI Culinary Response via OpenAI Chat Completion
    const systemPrompt = `You are Culina AI Sous Chef, an expert Michelin-trained culinary advisor and nutrition assistant.
Speak in an elegant, warm, and encouraging tone.
When the user describes their cravings, mood, available pantry items, or constraints, explain why your suggested recipe is the ideal match, giving culinary tips and highlighting its macro balance.
${recipeContext ? `\nAvailable Recipe Context from Database:\n${recipeContext}` : ''}
Keep your advice clear, practical, and conversational.`

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      })),
      { role: 'user', content: prompt },
    ]

    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    let aiText = "Here are my top culinary recommendations based on your craving!"
    if (chatRes.ok) {
      const chatData = await chatRes.json()
      aiText = chatData.choices?.[0]?.message?.content?.trim() || aiText
    }

    return new Response(
      JSON.stringify({
        message: aiText,
        suggestedRecipes: retrievedRecipes,
        user: userEmail,
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

