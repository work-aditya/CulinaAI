import React from 'react'
import { DietaryFilters } from '../types'
import { Clock, Flame, X, RotateCcw } from 'lucide-react'

interface DietaryFilterBarProps {
  filters: DietaryFilters
  setFilters: React.Dispatch<React.SetStateAction<DietaryFilters>>
}

const DIET_OPTIONS = [
  { id: '', label: 'All Diets' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten free', label: 'Gluten-Free' },
  { id: 'ketogenic', label: 'Keto' },
  { id: 'pescetarian', label: 'Pescetarian' },
]

export const DietaryFilterBar: React.FC<DietaryFilterBarProps> = ({ filters, setFilters }) => {
  const handleDietChange = (diet: string) => {
    setFilters((prev) => ({ ...prev, diet }))
  }

  const handleMaxCaloriesChange = (val: number | undefined) => {
    setFilters((prev) => ({ ...prev, maxCalories: val }))
  }

  const handleMaxTimeChange = (val: number | undefined) => {
    setFilters((prev) => ({ ...prev, maxReadyTime: val }))
  }

  const handleReset = () => {
    setFilters({
      diet: '',
      intolerances: [],
      maxCalories: undefined,
      maxReadyTime: undefined,
    })
  }

  const hasActiveFilters = Boolean(filters.diet || filters.maxCalories || filters.maxReadyTime)

  return (
    <div className="max-w-6xl mx-auto px-4 mb-8">
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#24251F]/8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Diets Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#77796F] uppercase tracking-wider mr-2">
              Diet:
            </span>
            {DIET_OPTIONS.map((opt) => {
              const active = filters.diet === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleDietChange(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#557A46] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#24251F] hover:bg-[#24251F]/5'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Quick Constraints (Time & Calories) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Max Time Filter */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F3] px-3 py-1.5 rounded-xl border border-[#24251F]/6">
              <Clock className="w-3.5 h-3.5 text-[#557A46]" />
              <label htmlFor="time-select" className="sr-only">Max cooking time</label>
              <select
                id="time-select"
                value={filters.maxReadyTime || ''}
                onChange={(e) =>
                  handleMaxTimeChange(e.target.value ? Number(e.target.value) : undefined)
                }
                className="bg-transparent text-xs font-medium text-[#24251F] focus:outline-none cursor-pointer"
              >
                <option value="">Any Time</option>
                <option value="20">Under 20 mins</option>
                <option value="30">Under 30 mins</option>
                <option value="45">Under 45 mins</option>
                <option value="60">Under 60 mins</option>
              </select>
            </div>

            {/* Max Calories Filter */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F3] px-3 py-1.5 rounded-xl border border-[#24251F]/6">
              <Flame className="w-3.5 h-3.5 text-[#E6A45B]" />
              <label htmlFor="calorie-select" className="sr-only">Max calories</label>
              <select
                id="calorie-select"
                value={filters.maxCalories || ''}
                onChange={(e) =>
                  handleMaxCaloriesChange(e.target.value ? Number(e.target.value) : undefined)
                }
                className="bg-transparent text-xs font-medium text-[#24251F] focus:outline-none cursor-pointer"
              >
                <option value="">Any Calories</option>
                <option value="400">Under 400 kcal</option>
                <option value="500">Under 500 kcal</option>
                <option value="650">Under 650 kcal</option>
                <option value="800">Under 800 kcal</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#77796F] hover:text-[#24251F] hover:bg-[#24251F]/5 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-[#24251F]/6 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#77796F]">Active:</span>
            {filters.diet && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#557A46]/10 text-[#557A46] text-xs font-medium">
                {filters.diet}
                <button
                  type="button"
                  onClick={() => handleDietChange('')}
                  className="hover:opacity-75"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxReadyTime && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#557A46]/10 text-[#557A46] text-xs font-medium">
                ≤ {filters.maxReadyTime} mins
                <button
                  type="button"
                  onClick={() => handleMaxTimeChange(undefined)}
                  className="hover:opacity-75"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxCalories && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E6A45B]/15 text-[#24251F] text-xs font-medium">
                ≤ {filters.maxCalories} kcal
                <button
                  type="button"
                  onClick={() => handleMaxCaloriesChange(undefined)}
                  className="hover:opacity-75"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

