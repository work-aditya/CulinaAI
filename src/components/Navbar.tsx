import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UtensilsCrossed, Heart, ShoppingBag, Sparkles, User, LogIn, ChefHat } from 'lucide-react'
import { useCulina } from '../context/CulinaContext'
import { AuthModal } from './AuthModal'

interface NavbarProps {
  onOpenAi?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAi }) => {
  const { favorites, groceryList, user, setUser } = useCulina()
  const location = useLocation()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Discover', icon: UtensilsCrossed },
    { to: '/favorites', label: 'Saved Recipes', icon: Heart, count: favorites.length },
    { to: '/grocery-list', label: 'Grocery List', icon: ShoppingBag, count: groceryList.length },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#24251F]/8 w-full max-w-full">
        {/* Container with exact 20px right padding (pr-[20px]) */}
        <div className="max-w-7xl mx-auto pl-3 sm:pl-6 lg:pl-8 pr-[20px] h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#557A46] text-white flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-[#FAF8F3]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#24251F] leading-none">
                  Culina<span className="text-[#557A46]">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#E6A45B]/15 text-[#24251F]">
                  <Sparkles className="w-2.5 h-2.5 text-[#E6A45B]" />
                  Smart
                </span>
              </div>
              <span className="hidden md:block text-[11px] font-medium text-[#77796F] tracking-wide uppercase truncate mt-0.5">
                Think Ingredients. Discover Recipes.
              </span>
            </div>
          </Link>

          {/* Navigation Links & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Nav Links */}
            <nav className="flex items-center gap-0.5 sm:gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#557A46]/10 text-[#557A46]'
                        : 'text-[#24251F]/80 hover:text-[#24251F] hover:bg-[#24251F]/5'
                    }`}
                    title={link.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#557A46]' : 'text-[#77796F]'}`} />
                    <span className="hidden md:inline">{link.label}</span>
                    {link.count !== undefined && link.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-semibold ${
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

            <div className="w-px h-5 sm:h-6 bg-[#24251F]/10 hidden sm:block mx-1" />

            {/* Actions: Sign In (left) and AI Logo (right) with exact 20px gap between them */}
            <div className="flex items-center gap-[20px] shrink-0">
              {/* Sign In Button */}
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-white border border-[#24251F]/10 text-[#24251F] hover:bg-[#FAF8F3] hover:border-[#557A46]/40 transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                {user ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-[#557A46] text-white flex items-center justify-center text-[10px]">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="hidden sm:inline max-w-[85px] truncate">
                      {user.email?.split('@')[0] || 'Chef'}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-[#557A46]" />
                    <span className="hidden xs:inline">Sign In</span>
                  </>
                )}
              </button>

              {/* AI Logo Button: Stuck to the right of navbar */}
              <button
                type="button"
                onClick={onOpenAi}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-[#557A46] text-white hover:bg-[#456538] transition-all shadow-xs cursor-pointer group shrink-0 active:scale-95"
                title="Ask AI Sous Chef"
              >
                <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ChefHat className="w-3.5 h-3.5 text-[#FAF8F3]" />
                </div>
                <span className="hidden sm:inline font-editorial font-bold tracking-wide">
                  AI Chef
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E6A45B] text-[#24251F] shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span className="sm:hidden">AI</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUserChange={setUser}
      />
    </>
  )
}
