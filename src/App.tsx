import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { GroceryListPage } from './pages/GroceryListPage'
import { AiChefAssistant } from './components/AiChefAssistant'
import { RecipeDetailModal } from './components/RecipeDetailModal'
import { Recipe } from './types'
import { UtensilsCrossed, ShieldCheck, Heart } from 'lucide-react'

export const App: React.FC = () => {
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#24251F]">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/grocery-list" element={<GroceryListPage />} />
        </Routes>
      </div>

      {/* Floating AI Sous Chef Assistant */}
      <AiChefAssistant onSelectRecipe={(recipe) => setActiveRecipe(recipe)} />

      {/* Global Recipe Detail Modal for AI Assistant Trigger */}
      <RecipeDetailModal
        recipe={activeRecipe}
        onClose={() => setActiveRecipe(null)}
      />

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-[#24251F]/8 bg-white/50 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77796F]">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-[#557A46]" />
            <span className="font-editorial font-bold text-[#24251F]">CulinaAI</span>
            <span>&mdash; Think Ingredients. Discover Recipes.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#557A46]" />
              Authentic Ingredients & Photography
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-[#557A46] fill-[#557A46]" /> for Home Chefs
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
