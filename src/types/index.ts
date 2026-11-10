export type SearchMode = 'description' | 'ingredients' | 'dietary'

export interface Ingredient {
  id: number | string
  name: string
  amount: number
  unit: string
  original: string
  aisle?: string
}

export interface InstructionStep {
  number: number
  step: string
  ingredients?: { id: number; name: string }[]
}

export interface Recipe {
  id: number | string
  title: string
  image: string
  summary?: string
  readyInMinutes: number
  servings: number
  sourceUrl?: string
  calories?: number
  protein?: string
  carbs?: string
  fat?: string
  diets: string[]
  cuisines?: string[]
  dishTypes?: string[]
  extendedIngredients: Ingredient[]
  analyzedInstructions?: InstructionStep[]
  matchReason?: string
  missedIngredientCount?: number
  usedIngredientCount?: number
  isFavorite?: boolean
}

export interface DietaryFilters {
  diet: string
  intolerances: string[]
  maxCalories?: number
  maxReadyTime?: number
}

export interface GroceryItem {
  id: string
  name: string
  amount: number
  unit: string
  checked: boolean
  recipeIds: (number | string)[]
  recipeTitles: string[]
  aisle?: string
}

