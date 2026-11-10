import React, { useState } from 'react'
import { useCulina } from '../context/CulinaContext'
import { RecipeCard } from '../components/RecipeCard'
import { RecipeDetailModal } from '../components/RecipeDetailModal'
import { Recipe } from '../types'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const FavoritesPage: React.FC = () => {
  const { favorites, addRecipeToGroceryList } = useCulina()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const handleAddAllToGrocery = () => {
    favorites.forEach((recipe) => addRecipeToGroceryList(recipe))
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#24251F]/8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#557A46] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#557A46]/10 text-[#557A46] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-[#557A46]" />
            </div>
            <h1 className="font-editorial text-3xl font-bold text-[#24251F]">
              Saved Recipes
            </h1>
          </div>
          <p className="text-xs text-[#77796F] mt-1">
            {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'} in your personal cookbook
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            type="button"
            onClick={handleAddAllToGrocery}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#557A46] text-white text-xs font-semibold hover:bg-[#456538] transition-colors shadow-sm self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All Ingredients to Grocery List</span>
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={(r) => setSelectedRecipe(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#557A46]/10 text-[#557A46] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-[#557A46]" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
            No saved recipes yet
          </h2>
          <p className="text-sm text-[#77796F] leading-relaxed">
            Click the heart icon on any recipe card to save it to your personal cookbook for quick access anytime.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#557A46] text-white text-xs font-semibold hover:bg-[#456538] transition-colors shadow-sm"
          >
            Explore Recipes
          </Link>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  )
}

