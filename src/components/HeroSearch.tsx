import React, { useState, useEffect } from 'react'
import { Search, Sparkles, Carrot, SlidersHorizontal, X, Plus, History, ArrowRight } from 'lucide-react'
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
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('culina_recent_searches')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('culina_recent_searches', JSON.stringify(recentSearches))
  }, [recentSearches])

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())
      return [trimmed, ...filtered].slice(0, 5)
    })
  }

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

  const handleSearchTrigger = () => {
    if (query.trim()) {
      saveRecentSearch(query)
    }
    onSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchMode === 'ingredients' && ingredientInput.trim()) {
        handleAddIngredient(ingredientInput)
      } else {
        handleSearchTrigger()
      }
    }
  }

  const handleSelectRecent = (term: string) => {
    setQuery(term)
    setSearchMode('description')
    saveRecentSearch(term)
    onSearch()
  }

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches(recentSearches.filter((item) => item !== term))
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center pt-6 sm:pt-8 pb-8 sm:pb-10 px-3 sm:px-4 overflow-hidden">
      {/* Editorial Headline */}
      <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#557A46]/10 text-[#557A46]">
          <Sparkles className="w-3.5 h-3.5" />
          Natural-Language Culinary Intelligence
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal text-[#24251F] tracking-tight leading-[1.18] sm:leading-[1.15]">
          Think Ingredients. <br />
          <span className="italic font-normal text-[#557A46]">Discover Recipes.</span>
        </h1>
        <p className="text-[#77796F] text-xs sm:text-base md:text-lg max-w-2xl mx-auto font-normal px-2">
          Describe what you crave, list items in your pantry, or set strict nutritional goals.
          Our AI crafts real culinary matches instantly.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="w-full flex justify-center mb-6 overflow-x-auto no-scrollbar px-1">
        <div className="inline-flex p-1 rounded-2xl bg-[#24251F]/6 border border-[#24251F]/8 shadow-xs max-w-full">
          <button
            type="button"
            onClick={() => setSearchMode('description')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              searchMode === 'description'
                ? 'bg-white text-[#24251F] shadow-xs'
                : 'text-[#77796F] hover:text-[#24251F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E6A45B] shrink-0" />
            <span className="sm:hidden">Describe</span>
            <span className="hidden sm:inline">Natural Description</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('ingredients')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              searchMode === 'ingredients'
                ? 'bg-white text-[#24251F] shadow-xs'
                : 'text-[#77796F] hover:text-[#24251F]'
            }`}
          >
            <Carrot className="w-3.5 h-3.5 text-[#557A46] shrink-0" />
            <span className="sm:hidden">Pantry</span>
            <span className="hidden sm:inline">Pantry & Ingredients</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('dietary')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              searchMode === 'dietary'
                ? 'bg-white text-[#24251F] shadow-xs'
                : 'text-[#77796F] hover:text-[#24251F]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#557A46] shrink-0" />
            <span className="sm:hidden">Dietary</span>
            <span className="hidden sm:inline">Dietary & Health</span>
          </button>
        </div>
      </div>

      {/* Main Search Input Card */}
      <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-md border border-[#24251F]/8 text-left transition-shadow focus-within:shadow-lg focus-within:border-[#557A46]/40 max-w-full">
        {searchMode === 'ingredients' ? (
          <div className="space-y-3 p-1 sm:p-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-h-12 p-2 rounded-xl bg-[#FAF8F3] border border-[#24251F]/6">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#24251F]/10 text-xs sm:text-sm font-medium text-[#24251F] shadow-2xs"
                >
                  <Carrot className="w-3 h-3 text-[#557A46] shrink-0" />
                  <span className="truncate max-w-[120px]">{ing}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing)}
                    className="p-0.5 rounded-full hover:bg-[#24251F]/10 text-[#77796F] hover:text-[#24251F]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex-1 min-w-[130px] sm:min-w-[180px] flex items-center">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    ingredients.length === 0
                      ? 'Type an ingredient & hit Enter...'
                      : 'Add ingredient...'
                  }
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-[#24251F] focus:outline-none placeholder:text-[#77796F]/70 px-2 py-1"
                />
              </div>

              {ingredientInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddIngredient(ingredientInput)}
                  className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#557A46] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#456538] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            {/* Quick Pantry Suggestion Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#77796F]">
              <span className="font-medium mr-1 text-[11px]">Popular:</span>
              {PANTRY_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddIngredient(item)}
                  disabled={ingredients.includes(item)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs transition-colors ${
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="pl-2 sm:pl-3 text-[#77796F] shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#557A46]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchMode === 'dietary'
                  ? 'E.g., high-protein dinner under 550 cal'
                  : 'Describe what you want to cook (e.g. garlic pasta)...'
              }
              className="flex-1 min-w-0 bg-transparent border-none text-xs sm:text-sm md:text-base text-[#24251F] placeholder:text-[#77796F]/70 focus:outline-none px-1.5 sm:px-2 py-2 sm:py-3"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-[#77796F] hover:text-[#24251F] rounded-full shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearchTrigger}
              className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#557A46] hover:bg-[#456538] text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Find Recipes</span>
            </button>
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && searchMode !== 'ingredients' && (
        <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-[#77796F] max-w-full">
          <span className="flex items-center gap-1 font-medium text-[#24251F]/60 text-[11px]">
            <History className="w-3 h-3 text-[#557A46]" /> Recent:
          </span>
          {recentSearches.map((term) => (
            <span
              key={term}
              onClick={() => handleSelectRecent(term)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#24251F]/5 hover:bg-[#557A46]/10 hover:text-[#557A46] text-[#24251F] text-[11px] cursor-pointer transition-colors max-w-[150px] truncate"
            >
              <span className="truncate">{term}</span>
              <button
                type="button"
                onClick={(e) => removeRecentSearch(term, e)}
                className="hover:text-red-500 shrink-0"
                title="Remove search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggested Inspiration Prompts */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-[#77796F] max-w-full">
        <span className="font-medium text-[#24251F]/70 text-[11px] block w-full sm:w-auto mb-1 sm:mb-0">
          Try searching:
        </span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setQuery(prompt)
              setSearchMode('description')
              saveRecentSearch(prompt)
              onSearch()
            }}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-white/80 border border-[#24251F]/8 hover:border-[#557A46]/30 hover:bg-[#557A46]/5 hover:text-[#557A46] text-[#24251F] text-[11px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 truncate max-w-full"
          >
            <span className="truncate">"{prompt}"</span>
            <ArrowRight className="w-3 h-3 opacity-50 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
