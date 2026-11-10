import React, { useState } from 'react'
import { useCulina } from '../context/CulinaContext'
import { ShoppingBag, CheckCircle2, Circle, Trash2, Copy, Check, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const GroceryListPage: React.FC = () => {
  const { groceryList, toggleGroceryItem, removeGroceryItem, clearGroceryList } = useCulina()
  const [copied, setCopied] = useState(false)

  // Group items by aisle
  const groupedItems = groceryList.reduce<Record<string, typeof groceryList>>((acc, item) => {
    const aisle = item.aisle || 'General Pantry'
    if (!acc[aisle]) acc[aisle] = []
    acc[aisle].push(item)
    return acc
  }, {})

  const completedCount = groceryList.filter((i) => i.checked).length
  const totalCount = groceryList.length

  const handleCopyClipboard = () => {
    if (groceryList.length === 0) return
    const text = Object.entries(groupedItems)
      .map(([aisle, items]) => {
        const itemLines = items
          .map((i) => `  ${i.checked ? '[x]' : '[ ]'} ${i.amount} ${i.unit} ${i.name}`)
          .join('\n')
        return `${aisle.toUpperCase()}:\n${itemLines}`
      })
      .join('\n\n')

    navigator.clipboard.writeText(`CulinaAI Grocery List:\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#24251F]/8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#557A46] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#557A46]/10 text-[#557A46] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#557A46]" />
            </div>
            <h1 className="font-editorial text-3xl font-bold text-[#24251F]">
              Consolidated Grocery List
            </h1>
          </div>
          <p className="text-xs text-[#77796F] mt-1">
            {completedCount} of {totalCount} items completed &bull; De-duplicated across recipes
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#24251F]/10 text-xs font-semibold text-[#24251F] hover:bg-[#FAF8F3] transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#557A46]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#77796F]" />
                  <span>Copy List</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={clearGroceryList}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200/50 text-xs font-semibold hover:bg-red-100/70 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-white border border-[#24251F]/8 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#24251F]">
            <span>Shopping Progress</span>
            <span>{Math.round((completedCount / (totalCount || 1)) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#FAF8F3] overflow-hidden border border-[#24251F]/6">
            <div
              className="h-full bg-[#557A46] transition-all duration-300"
              style={{ width: `${(completedCount / (totalCount || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Grouped Checklist */}
      {totalCount > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([aisle, items]) => (
            <div key={aisle} className="bg-white rounded-2xl border border-[#24251F]/8 p-5 shadow-xs">
              <h2 className="text-xs font-bold text-[#557A46] uppercase tracking-wider mb-3">
                {aisle} ({items.length})
              </h2>
              <ul className="divide-y divide-[#24251F]/6">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                      onClick={() => toggleGroceryItem(item.id)}
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-[#557A46] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#77796F]/40 group-hover:text-[#557A46] shrink-0 transition-colors" />
                      )}
                      <div>
                        <span
                          className={`text-sm font-medium transition-all ${
                            item.checked
                              ? 'line-through text-[#77796F]/60'
                              : 'text-[#24251F]'
                          }`}
                        >
                          {item.name}
                        </span>
                        <div className="text-[11px] text-[#77796F]">
                          Used in: {item.recipeTitles.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FAF8F3] text-[#24251F] border border-[#24251F]/6">
                        {item.amount} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGroceryItem(item.id)}
                        className="p-1 text-[#77796F]/40 hover:text-red-500 rounded-md transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#557A46]/10 text-[#557A46] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-[#557A46]" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
            Your grocery list is empty
          </h2>
          <p className="text-sm text-[#77796F] leading-relaxed">
            Select "Grocery List" on any recipe card to automatically consolidate and de-duplicate ingredients here.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#557A46] text-white text-xs font-semibold hover:bg-[#456538] transition-colors shadow-sm"
          >
            Find Recipes
          </Link>
        </div>
      )}
    </div>
  )
}

