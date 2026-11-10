import React, { createContext, useContext, useState, useEffect } from 'react'
import { Recipe, GroceryItem, Ingredient } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface CulinaContextType {
  user: any
  setUser: (user: any) => void
  favorites: Recipe[]
  toggleFavorite: (recipe: Recipe) => void
  isFavorite: (id: string | number) => boolean
  groceryList: GroceryItem[]
  addRecipeToGroceryList: (recipe: Recipe) => void
  toggleGroceryItem: (id: string) => void
  removeGroceryItem: (id: string) => void
  clearGroceryList: () => void
}

const CulinaContext = createContext<CulinaContextType | undefined>(undefined)

export const CulinaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    try {
      const demo = localStorage.getItem('culina_demo_user')
      return demo ? JSON.parse(demo) : null
    } catch {
      return null
    }
  })

  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('culina_favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem('culina_grocery_list')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sync favorites with Supabase if authenticated
  useEffect(() => {
    if (user && isSupabaseConfigured && user.id !== 'demo-user-123') {
      supabase
        .from('user_favorites')
        .select('recipe_data')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setFavorites(data.map((row: any) => row.recipe_data))
          }
        })
    }
  }, [user])

  // Save to local storage as continuous fallback
  useEffect(() => {
    localStorage.setItem('culina_favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('culina_grocery_list', JSON.stringify(groceryList))
  }, [groceryList])

  const toggleFavorite = async (recipe: Recipe) => {
    const exists = favorites.some((r) => r.id === recipe.id)

    if (exists) {
      setFavorites((prev) => prev.filter((r) => r.id !== recipe.id))
      if (user && isSupabaseConfigured && user.id !== 'demo-user-123') {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('user_id', user.id)
      }
    } else {
      setFavorites((prev) => [...prev, recipe])
      if (user && isSupabaseConfigured && user.id !== 'demo-user-123') {
        await supabase.from('user_favorites').upsert({
          user_id: user.id,
          recipe_id: recipe.id,
          recipe_data: recipe,
        })
      }
    }
  }

  const isFavorite = (id: string | number) => {
    return favorites.some((r) => r.id === id)
  }

  const addRecipeToGroceryList = (recipe: Recipe) => {
    setGroceryList((prev) => {
      const updated = [...prev]

      recipe.extendedIngredients.forEach((ing: Ingredient) => {
        const cleanName = ing.name.toLowerCase().trim()
        const existingIdx = updated.findIndex(
          (item) => item.name.toLowerCase().trim() === cleanName && item.unit === ing.unit
        )

        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            amount: Number((updated[existingIdx].amount + (ing.amount || 1)).toFixed(1)),
            recipeTitles: Array.from(new Set([...updated[existingIdx].recipeTitles, recipe.title])),
            recipeIds: Array.from(new Set([...updated[existingIdx].recipeIds, recipe.id])),
          }
        } else {
          updated.push({
            id: `${recipe.id}-${ing.id}-${Date.now()}-${Math.random()}`,
            name: ing.name,
            amount: ing.amount || 1,
            unit: ing.unit || 'unit',
            checked: false,
            recipeIds: [recipe.id],
            recipeTitles: [recipe.title],
            aisle: ing.aisle || 'Pantry',
          })
        }
      })

      return updated
    })
  }

  const toggleGroceryItem = (id: string) => {
    setGroceryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }

  const removeGroceryItem = (id: string) => {
    setGroceryList((prev) => prev.filter((item) => item.id !== id))
  }

  const clearGroceryList = () => {
    setGroceryList([])
  }

  return (
    <CulinaContext.Provider
      value={{
        user,
        setUser,
        favorites,
        toggleFavorite,
        isFavorite,
        groceryList,
        addRecipeToGroceryList,
        toggleGroceryItem,
        removeGroceryItem,
        clearGroceryList,
      }}
    >
      {children}
    </CulinaContext.Provider>
  )
}

export function useCulina() {
  const context = useContext(CulinaContext)
  if (!context) {
    throw new Error('useCulina must be used within a CulinaProvider')
  }
  return context
}
