import React, { createContext, useContext, useState, useEffect } from 'react'
import { Recipe, GroceryItem, Ingredient } from '../types'

interface CulinaContextType {
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

  useEffect(() => {
    localStorage.setItem('culina_favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('culina_grocery_list', JSON.stringify(groceryList))
  }, [groceryList])

  const toggleFavorite = (recipe: Recipe) => {
    setFavorites((prev) => {
      const exists = prev.some((r) => r.id === recipe.id)
      if (exists) {
        return prev.filter((r) => r.id !== recipe.id)
      } else {
        return [...prev, recipe]
      }
    })
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
          // Consolidate quantity
          updated[existingIdx] = {
            ...updated[existingIdx],
            amount: Number((updated[existingIdx].amount + (ing.amount || 1)).toFixed(1)),
            recipeTitles: Array.from(new Set([...updated[existingIdx].recipeTitles, recipe.title])),
            recipeIds: Array.from(new Set([...updated[existingIdx].recipeIds, recipe.id])),
          }
        } else {
          // Add new consolidated entry
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

