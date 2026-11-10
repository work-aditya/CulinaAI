import React, { useEffect } from 'react'
import { Recipe } from '../types'
import { X, Clock, Users, Flame, Heart, ShoppingBag, Check, ChefHat } from 'lucide-react'
import { useCulina } from '../context/CulinaContext'

interface RecipeDetailModalProps {
  recipe: Recipe | null
  onClose: () => void
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose }) => {
  const { toggleFavorite, isFavorite, addRecipeToGroceryList, groceryList } = useCulina()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (recipe) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [recipe, onClose])

  if (!recipe) return null

  const favorite = isFavorite(recipe.id)
  const isAlreadyInGrocery = groceryList.some((item) =>
    item.recipeIds.includes(recipe.id)
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FAF8F3] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#24251F]/10 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image & Controls */}
        <div className="relative h-64 sm:h-80 shrink-0 overflow-hidden bg-black">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#24251F]/90 via-[#24251F]/30 to-transparent" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(recipe)}
              aria-label={favorite ? 'Remove from saved' : 'Save recipe'}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#24251F] hover:bg-white shadow-sm transition-transform active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favorite ? 'fill-[#557A46] text-[#557A46]' : 'text-[#24251F]'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#24251F] hover:bg-white shadow-sm transition-transform active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Title & Meta */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {recipe.diets.map((diet) => (
                <span
                  key={diet}
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#557A46] text-white capitalize shadow-xs"
                >
                  {diet}
                </span>
              ))}
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight">
              {recipe.title}
            </h2>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-white/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E6A45B]" />
                {recipe.readyInMinutes} minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </span>
              {recipe.calories && (
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#E6A45B]" />
                  {recipe.calories} kcal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* AI Match Explanation */}
          {recipe.matchReason && (
            <div className="p-4 rounded-2xl bg-[#557A46]/10 border border-[#557A46]/20 flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-[#557A46] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#557A46] uppercase tracking-wider mb-0.5">
                  Why this matches your search
                </p>
                <p className="text-sm text-[#24251F]/90 font-normal leading-relaxed">
                  {recipe.matchReason}
                </p>
              </div>
            </div>
          )}

          {/* Nutritional Summary */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#77796F] mb-3">
              Nutritional Profile (per serving)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#24251F]/8 text-center shadow-2xs">
                <span className="text-xs text-[#77796F] block">Calories</span>
                <span className="font-editorial text-lg font-bold text-[#24251F]">
                  {recipe.calories || 450} kcal
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#24251F]/8 text-center shadow-2xs">
                <span className="text-xs text-[#77796F] block">Protein</span>
                <span className="font-editorial text-lg font-bold text-[#557A46]">
                  {recipe.protein || '18g'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#24251F]/8 text-center shadow-2xs">
                <span className="text-xs text-[#77796F] block">Carbohydrates</span>
                <span className="font-editorial text-lg font-bold text-[#24251F]">
                  {recipe.carbs || '54g'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#24251F]/8 text-center shadow-2xs">
                <span className="text-xs text-[#77796F] block">Fats</span>
                <span className="font-editorial text-lg font-bold text-[#E6A45B]">
                  {recipe.fat || '15g'}
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial text-xl font-bold text-[#24251F]">
                Ingredients ({recipe.extendedIngredients.length})
              </h3>
              <button
                type="button"
                onClick={() => addRecipeToGroceryList(recipe)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isAlreadyInGrocery
                    ? 'bg-[#557A46] text-white shadow-xs'
                    : 'bg-[#557A46]/10 text-[#557A46] hover:bg-[#557A46] hover:text-white'
                }`}
              >
                {isAlreadyInGrocery ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>In Grocery List</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Grocery List</span>
                  </>
                )}
              </button>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.extendedIngredients.map((ing) => (
                <li
                  key={`${ing.id}-${ing.name}`}
                  className="p-3 rounded-xl bg-white border border-[#24251F]/8 flex items-center justify-between gap-3 text-sm shadow-2xs"
                >
                  <span className="font-medium text-[#24251F]">{ing.name}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#FAF8F3] text-[#77796F] shrink-0 border border-[#24251F]/6">
                    {ing.amount} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions Section */}
          {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#24251F] mb-4">
                Step-by-Step Instructions
              </h3>
              <ol className="space-y-4">
                {recipe.analyzedInstructions.map((step) => (
                  <li
                    key={step.number}
                    className="p-4 rounded-2xl bg-white border border-[#24251F]/8 flex items-start gap-4 shadow-2xs"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#557A46] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {step.number}
                    </span>
                    <p className="text-sm text-[#24251F] leading-relaxed pt-0.5">
                      {step.step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

