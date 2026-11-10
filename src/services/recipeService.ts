import { Recipe, DietaryFilters, SearchMode } from '../types'
import { INITIAL_RECIPES } from '../data/mockRecipes'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
  await new Promise((resolve) => setTimeout(resolve, 400)) // smooth simulated network latency

  let results = [...INITIAL_RECIPES]

  if (query.trim()) {
    const q = query.toLowerCase()
    results = results.filter((r) => {
      const inTitle = r.title.toLowerCase().includes(q)
      const inSummary = r.summary?.toLowerCase().includes(q)
      const inDiets = r.diets.some((d) => d.toLowerCase().includes(q))
      const inCuisines = r.cuisines?.some((c) => c.toLowerCase().includes(q))
      const inIngredients = r.extendedIngredients.some((i) =>
        i.name.toLowerCase().includes(q)
      )
      return inTitle || inSummary || inDiets || inCuisines || inIngredients
    })
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

