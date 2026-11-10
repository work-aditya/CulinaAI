import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UtensilsCrossed, Heart, ShoppingBag, Sparkles } from 'lucide-react'
import { useCulina } from '../context/CulinaContext'

export const Navbar: React.FC = () => {
  const { favorites, groceryList } = useCulina()
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Discover', icon: UtensilsCrossed },
    { to: '/favorites', label: 'Saved Recipes', icon: Heart, count: favorites.length },
    { to: '/grocery-list', label: 'Grocery List', icon: ShoppingBag, count: groceryList.length },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#24251F]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#557A46] text-white flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
            <UtensilsCrossed className="w-5 h-5 text-[#FAF8F3]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#24251F]">
                Culina<span className="text-[#557A46]">AI</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#E6A45B]/15 text-[#24251F]">
                <Sparkles className="w-2.5 h-2.5 text-[#E6A45B]" />
                Smart
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#77796F] tracking-wide uppercase">
              Think Ingredients. Discover Recipes.
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#557A46]/10 text-[#557A46]'
                    : 'text-[#24251F]/80 hover:text-[#24251F] hover:bg-[#24251F]/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#557A46]' : 'text-[#77796F]'}`} />
                <span className="hidden sm:inline">{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                      isActive ? 'bg-[#557A46] text-white' : 'bg-[#24251F]/10 text-[#24251F]'
                    }`}
                  >
                    {link.count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

