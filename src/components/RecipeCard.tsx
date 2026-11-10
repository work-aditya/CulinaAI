import React from 'react'
import { Recipe } from '../types'
import { Clock, Users, Flame, Heart, PlusCircle, Check } from 'lucide-react'
import { useCulina } from '../context/CulinaContext'

interface RecipeCardProps {
  recipe: Recipe
  onSelect: (recipe: Recipe) => void
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const { toggleFavorite, isFavorite, addRecipeToGroceryList, groceryList } = useCulina()
  const favorite = isFavorite(recipe.id)

  const isAlreadyInGrocery = groceryList.some((item) =>
    item.recipeIds.includes(recipe.id)
  )

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#24251F]/8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-16/10 overflow-hidden bg-[#FAF8F3]">
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient Overlay for Tag Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />

          {/* Time & Servings Badges */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
              <Clock className="w-3 h-3 text-[#E6A45B]" />
              {recipe.readyInMinutes}m
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
              <Users className="w-3 h-3 text-white/80" />
              {recipe.servings}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(recipe)
            }}
            aria-label={favorite ? 'Remove from saved recipes' : 'Save recipe'}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[#24251F] hover:bg-white transition-transform active:scale-90 shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? 'fill-[#557A46] text-[#557A46]' : 'text-[#24251F]/70'
              }`}
            />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Diets & Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {recipe.diets.slice(0, 2).map((diet) => (
              <span
                key={diet}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#557A46]/10 text-[#557A46] capitalize"
              >
                {diet}
              </span>
            ))}
            {recipe.calories && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF8F3] text-[#77796F] border border-[#24251F]/6">
                <Flame className="w-3 h-3 text-[#E6A45B]" />
                {recipe.calories} kcal
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(recipe)}
            className="font-editorial text-xl font-bold text-[#24251F] group-hover:text-[#557A46] transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {recipe.title}
          </h3>

          {/* Summary / Reason */}
          <p className="text-xs text-[#77796F] line-clamp-2 leading-relaxed">
            {recipe.matchReason || recipe.summary}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-3 border-t border-[#24251F]/6 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(recipe)}
          className="text-xs font-semibold text-[#557A46] hover:underline"
        >
          View Recipe & Steps →
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            addRecipeToGroceryList(recipe)
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isAlreadyInGrocery
              ? 'bg-[#557A46]/10 text-[#557A46]'
              : 'bg-[#FAF8F3] hover:bg-[#24251F]/5 text-[#24251F]'
          }`}
          title="Add all ingredients to your grocery list"
        >
          {isAlreadyInGrocery ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5 text-[#557A46]" />
              <span>Grocery List</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

