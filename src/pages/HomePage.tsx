import React, { useState } from 'react'
import { HeroSearch } from '../components/HeroSearch'
import { DietaryFilterBar } from '../components/DietaryFilterBar'
import { RecipeCard } from '../components/RecipeCard'
import { RecipeGridSkeleton } from '../components/SkeletonLoader'
import { RecipeDetailModal } from '../components/RecipeDetailModal'
import { searchRecipes } from '../services/recipeService'
import { Recipe, DietaryFilters, SearchMode } from '../types'
import { useQuery } from '@tanstack/react-query'
import { Compass, Sparkles, ChefHat } from 'lucide-react'

export const HomePage: React.FC = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('description')
  const [query, setQuery] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [filters, setFilters] = useState<DietaryFilters>({
    diet: '',
    intolerances: [],
    maxCalories: undefined,
    maxReadyTime: undefined,
  })
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const { data: recipes = [], isLoading, refetch } = useQuery({
    queryKey: ['recipes', query, searchMode, filters, ingredients],
    queryFn: () => searchRecipes(query, searchMode, filters, ingredients),
  })

  return (
    <div className="min-h-screen pb-20">
      {/* Visual Focus: Hero Search Section */}
      <section className="border-b border-[#24251F]/6 bg-gradient-to-b from-[#FAF8F3] via-white to-[#FAF8F3]">
        <HeroSearch
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          query={query}
          setQuery={setQuery}
          ingredients={ingredients}
          setIngredients={setIngredients}
          onSearch={() => refetch()}
        />

        <DietaryFilterBar filters={filters} setFilters={setFilters} />
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#24251F]/8">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#557A46]" />
              <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
                {query || ingredients.length > 0 || filters.diet
                  ? 'Matched Recipes'
                  : 'Curated Inspirations'}
              </h2>
            </div>
            <p className="text-xs text-[#77796F] mt-1">
              Showing {recipes.length} verified culinary {recipes.length === 1 ? 'recipe' : 'recipes'}
              {query && ` matching "${query}"`}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#24251F]/8 text-xs font-medium text-[#77796F] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E6A45B]" />
            Real nutrition & photography
          </div>
        </div>

        {/* Loading State with Skeletons */}
        {isLoading ? (
          <RecipeGridSkeleton count={4} />
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(r) => setSelectedRecipe(r)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#557A46]/10 text-[#557A46] flex items-center justify-center mx-auto">
              <ChefHat className="w-8 h-8" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#24251F]">
              No recipes matched your exact criteria
            </h3>
            <p className="text-sm text-[#77796F] leading-relaxed">
              Try loosening your dietary constraints, adjusting calorie limits, or searching for broader terms like "pasta", "curry", or "salmon".
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setIngredients([])
                setFilters({ diet: '', intolerances: [] })
              }}
              className="px-5 py-2.5 rounded-xl bg-[#557A46] text-white text-xs font-semibold hover:bg-[#456538] transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  )
}

