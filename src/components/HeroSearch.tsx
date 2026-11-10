import React, { useState } from 'react'
import { Search, Sparkles, Carrot, SlidersHorizontal, X, Plus } from 'lucide-react'
import { SearchMode } from '../types'

interface HeroSearchProps {
  searchMode: SearchMode
  setSearchMode: (mode: SearchMode) => void
  query: string
  setQuery: (query: string) => void
  ingredients: string[]
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>
  onSearch: () => void
}

const QUICK_PROMPTS = [
  'Quick 25-minute weeknight pasta',
  'High-protein dinner with avocado',
  'Warm Mediterranean grain bowl',
  'Comforting vegan coconut curry',
]

const PANTRY_SUGGESTIONS = [
  'Garlic', 'Olive Oil', 'Salmon', 'Spinach', 'Sweet Potato', 'Chickpeas', 'Rice', 'Tomatoes'
]

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchMode,
  setSearchMode,
  query,
  setQuery,
  ingredients,
  setIngredients,
  onSearch,
}) => {
  const [ingredientInput, setIngredientInput] = useState('')

  const handleAddIngredient = (name: string) => {
    const trimmed = name.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
      setIngredientInput('')
    }
  }

  const handleRemoveIngredient = (name: string) => {
    setIngredients(ingredients.filter((i) => i !== name))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchMode === 'ingredients' && ingredientInput.trim()) {
        handleAddIngredient(ingredientInput)
      } else {
        onSearch()
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center pt-8 pb-10 px-4">
      {/* Editorial Headline */}
      <div className="space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#557A46]/10 text-[#557A46]">
          <Sparkles className="w-3.5 h-3.5" />
          Natural-Language Culinary Intelligence
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-[#24251F] tracking-tight leading-[1.15]">
          Think Ingredients. <br />
          <span className="italic font-normal text-[#557A46]">Discover Recipes.</span>
        </h1>
        <p className="text-[#77796F] text-base sm:text-lg max-w-2xl mx-auto font-normal">
          Describe what you crave, list items in your pantry, or set strict nutritional goals.
          Our AI crafts real culinary matches instantly.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="inline-flex p-1 rounded-2xl bg-[#24251F]/6 border border-[#24251F]/8 mb-6 shadow-xs">
        <button
          type="button"
          onClick={() => setSearchMode('description')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            searchMode === 'description'
              ? 'bg-white text-[#24251F] shadow-sm'
              : 'text-[#77796F] hover:text-[#24251F]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#E6A45B]" />
          Natural Description
        </button>

        <button
          type="button"
          onClick={() => setSearchMode('ingredients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            searchMode === 'ingredients'
              ? 'bg-white text-[#24251F] shadow-sm'
              : 'text-[#77796F] hover:text-[#24251F]'
          }`}
        >
          <Carrot className="w-4 h-4 text-[#557A46]" />
          Pantry & Ingredients
        </button>

        <button
          type="button"
          onClick={() => setSearchMode('dietary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            searchMode === 'dietary'
              ? 'bg-white text-[#24251F] shadow-sm'
              : 'text-[#77796F] hover:text-[#24251F]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#557A46]" />
          Dietary & Health
        </button>
      </div>

      {/* Main Search Input Card */}
      <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-md border border-[#24251F]/8 text-left transition-shadow focus-within:shadow-lg focus-within:border-[#557A46]/40">
        {searchMode === 'ingredients' ? (
          <div className="space-y-3 p-1 sm:p-2">
            <div className="flex flex-wrap items-center gap-2 min-h-12 p-2 rounded-xl bg-[#FAF8F3] border border-[#24251F]/6">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#24251F]/10 text-xs sm:text-sm font-medium text-[#24251F] shadow-2xs"
                >
                  <Carrot className="w-3.5 h-3.5 text-[#557A46]" />
                  {ing}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing)}
                    className="p-0.5 rounded-full hover:bg-[#24251F]/10 text-[#77796F] hover:text-[#24251F]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              <div className="flex-1 min-w-[180px] flex items-center">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={ingredients.length === 0 ? "Type an ingredient (e.g. cauliflower, garlic) and press Enter..." : "Add another ingredient..."}
                  className="w-full bg-transparent border-none text-sm text-[#24251F] focus:outline-none placeholder:text-[#77796F]/70 px-2 py-1"
                />
              </div>

              {ingredientInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddIngredient(ingredientInput)}
                  className="px-3 py-1 rounded-lg bg-[#557A46] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#456538]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            {/* Quick Pantry Suggestion Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#77796F]">
              <span className="font-medium mr-1">Popular:</span>
              {PANTRY_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddIngredient(item)}
                  disabled={ingredients.includes(item)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    ingredients.includes(item)
                      ? 'opacity-40 cursor-not-allowed bg-[#24251F]/5 text-[#77796F]'
                      : 'bg-[#FAF8F3] hover:bg-[#557A46]/10 hover:text-[#557A46] text-[#24251F]'
                  }`}
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="pl-3 text-[#77796F]">
              <Search className="w-5 h-5 text-[#557A46]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchMode === 'dietary'
                  ? 'E.g., high-protein pescetarian dinner under 550 calories'
                  : 'Describe what you want to cook (e.g., "A cozy garlic & pasta dinner with greens")...'
              }
              className="flex-1 bg-transparent border-none text-sm sm:text-base text-[#24251F] placeholder:text-[#77796F]/70 focus:outline-none px-2 py-3"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 text-[#77796F] hover:text-[#24251F] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onSearch}
              className="px-5 py-3 rounded-xl bg-[#557A46] hover:bg-[#456538] text-white text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Find Recipes</span>
            </button>
          </div>
        )}
      </div>

      {/* Suggested Inspiration Prompts */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#77796F]">
        <span className="font-medium text-[#24251F]/70">Try searching:</span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setQuery(prompt)
              setSearchMode('description')
            }}
            className="px-3 py-1 rounded-full bg-white/80 border border-[#24251F]/8 hover:border-[#557A46]/30 hover:bg-[#557A46]/5 hover:text-[#557A46] text-[#24251F] transition-all cursor-pointer"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  )
}

