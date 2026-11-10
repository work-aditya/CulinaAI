import { Recipe, DietaryFilters, SearchMode } from '../types'
import { INITIAL_RECIPES } from '../data/mockRecipes'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { parseNaturalLanguageQuery } from '../lib/nlp'

export async function searchRecipes(
  query: string,
  mode: SearchMode,
  filters: DietaryFilters,
  ingredients: string[] = []
): Promise<Recipe[]> {
  // Try Supabase Edge Function if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('recipe-search', {
        body: { query, mode, filters, ingredients },
      })
      if (!error && data?.recipes && data.recipes.length > 0) {
        return data.recipes
      }
    } catch {
      // Graceful fallback to client-side filtering if edge function is unreachable
    }
  }

  // Client-side intelligent search simulation with accurate data
  await new Promise((resolve) => setTimeout(resolve, 350)) // smooth simulated network latency

  let results = [...INITIAL_RECIPES]

  if (query.trim()) {
    const intent = parseNaturalLanguageQuery(query)
    const q = query.toLowerCase()

    results = results.filter((r) => {
      // 1. Direct text search
      const inTitle = r.title.toLowerCase().includes(q)
      const inSummary = r.summary?.toLowerCase().includes(q)
      const inDiets = r.diets.some((d) => d.toLowerCase().includes(q))
      const inCuisines = r.cuisines?.some((c) => c.toLowerCase().includes(q))
      const inIngredients = r.extendedIngredients.some((i) =>
        i.name.toLowerCase().includes(q)
      )

      if (inTitle || inSummary || inDiets || inCuisines || inIngredients) {
        return true
      }

      // 2. Semantic NLP keyword match
      if (intent.keywords.length > 0) {
        const matchesKeyword = intent.keywords.some((kw) =>
          r.title.toLowerCase().includes(kw) ||
          r.extendedIngredients.some((i) => i.name.toLowerCase().includes(kw)) ||
          r.diets.some((d) => d.toLowerCase().includes(kw)) ||
          r.cuisines?.some((c) => c.toLowerCase().includes(kw))
        )
        if (matchesKeyword) return true
      }

      // 3. Cuisine match
      if (intent.detectedCuisines.length > 0) {
        const matchesCuisine = intent.detectedCuisines.some((c) =>
          r.cuisines?.some((rc) => rc.toLowerCase() === c)
        )
        if (matchesCuisine) return true
      }

      return false
    })

    // Dynamically annotate matching recipes with an explanation
    if (intent.keywords.length > 0) {
      results = results.map((r) => ({
        ...r,
        matchReason: `AI match: Identified intent for "${intent.keywords.join(', ')}"${
          intent.inferredDiet ? ` with ${intent.inferredDiet} diet profile` : ''
        }.`,
      }))
    }
  }

  if (ingredients.length > 0) {
    const searchTerms = ingredients.map((i) => i.toLowerCase().trim())
    results = results.filter((r) => {
      return searchTerms.some((term) =>
        r.extendedIngredients.some((ing) => ing.name.toLowerCase().includes(term))
      )
    })
  }

  if (filters.diet) {
    results = results.filter((r) =>
      r.diets.some((d) => d.toLowerCase() === filters.diet.toLowerCase())
    )
  }

  if (filters.maxCalories) {
    results = results.filter(
      (r) => (r.calories ?? 0) <= (filters.maxCalories ?? 1000)
    )
  }

  if (filters.maxReadyTime) {
    results = results.filter(
      (r) => r.readyInMinutes <= (filters.maxReadyTime ?? 60)
    )
  }

  return results
}
