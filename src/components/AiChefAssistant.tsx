import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Send,
  ChefHat,
  Clock,
  Flame,
  Heart,
  PlusCircle,
  Check,
  Bot,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react'
import { Recipe } from '../types'
import { INITIAL_RECIPES } from '../data/mockRecipes'
import { parseNaturalLanguageQuery } from '../lib/nlp'
import { useCulina } from '../context/CulinaContext'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  suggestedRecipes?: Recipe[]
  timestamp: Date
}

const STARTER_PROMPTS = [
  'Comfort food after a long day in under 30 mins',
  'High-protein dinner with salmon and avocado',
  'Quick 20-min vegetarian lunch with eggs',
  'Rich vegan curry with coconut milk',
  'Gluten-free Mediterranean dinner',
]

interface AiChefAssistantProps {
  onSelectRecipe: (recipe: Recipe) => void
}

export const AiChefAssistant: React.FC<AiChefAssistantProps> = ({ onSelectRecipe }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toggleFavorite, isFavorite, addRecipeToGroceryList, groceryList } = useCulina()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello Chef! 👋 I'm your AI Culinary Assistant. Tell me what you're in the mood for, what ingredients you have, or any dietary goals (e.g. 'I want a comforting dinner with mushrooms in under 30 minutes'), and I'll recommend the ideal recipe.",
      timestamp: new Date(),
    },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate intelligent culinary reasoning & match search
    setTimeout(() => {
      const intent = parseNaturalLanguageQuery(query)
      const q = query.toLowerCase()

      // Score recipes based on semantic match
      const scored = INITIAL_RECIPES.map((recipe) => {
        let score = 0
        const titleLower = recipe.title.toLowerCase()
        const summaryLower = (recipe.summary || '').toLowerCase()

        // 1. Exact phrase matches
        if (titleLower.includes(q) || summaryLower.includes(q)) score += 10

        // 2. Extracted keywords match
        intent.keywords.forEach((kw) => {
          if (titleLower.includes(kw)) score += 5
          if (recipe.extendedIngredients.some((i) => i.name.toLowerCase().includes(kw))) score += 4
          if (summaryLower.includes(kw)) score += 3
        })

        // 3. Cuisine match
        intent.detectedCuisines.forEach((c) => {
          if (recipe.cuisines?.some((rc) => rc.toLowerCase() === c)) score += 6
        })

        // 4. Ingredient match
        intent.detectedIngredients.forEach((ing) => {
          if (recipe.extendedIngredients.some((i) => i.name.toLowerCase().includes(ing))) score += 7
        })

        // 5. Inferred diet match
        if (intent.inferredDiet) {
          if (recipe.diets.some((d) => d.toLowerCase() === intent.inferredDiet)) score += 6
          else score -= 4 // penalize if requested diet isn't satisfied
        }

        // 6. Inferred time constraint match
        if (intent.inferredMaxTime) {
          if (recipe.readyInMinutes <= intent.inferredMaxTime) score += 4
          else score -= 3
        }

        return { recipe, score }
      })

      scored.sort((a, b) => b.score - a.score)
      const topMatches = scored.filter((s) => s.score > 2).slice(0, 2).map((s) => s.recipe)

      let aiResponseText = ''

      if (topMatches.length > 0) {
        const primary = topMatches[0]
        if (intent.inferredDiet && intent.inferredMaxTime) {
          aiResponseText = `I found a great fit! For your ${intent.inferredDiet} craving in under ${intent.inferredMaxTime} minutes, I recommend the **${primary.title}**. It takes just ${primary.readyInMinutes} minutes and gives you ${primary.calories} kcal of nourishing energy.`
        } else if (intent.detectedIngredients.length > 0) {
          aiResponseText = `Based on your request featuring ${intent.detectedIngredients.join(', ')}, here is the perfect recipe to make tonight:`
        } else {
          aiResponseText = `Here is my top recommendation for you based on "${query}":`
        }
      } else {
        // Fallback to 2 diverse popular recipes
        topMatches.push(INITIAL_RECIPES[0], INITIAL_RECIPES[4])
        aiResponseText = `I couldn't find an exact match for "${query}", but here are two top-rated recipes that might inspire you:`
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        suggestedRecipes: topMatches,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 600)
  }

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Chat cleared. What would you like to cook next? Ask for any craving, cuisine, or dietary goal!",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#557A46] text-white shadow-xl hover:bg-[#456538] hover:shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF8F3]" />
          </div>
          <span className="font-editorial text-xs sm:text-sm font-semibold tracking-wide pr-1">
            <span className="hidden sm:inline">Ask </span>AI Sous Chef
          </span>
          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#E6A45B] text-[#24251F]">
            <Sparkles className="w-2.5 h-2.5" />
            AI
          </span>
        </button>
      </div>

      {/* Slide-out Sidebar Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-md sm:max-w-lg bg-[#FAF8F3] h-full shadow-2xl flex flex-col border-l border-[#24251F]/10 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#24251F]/8 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#557A46] text-white flex items-center justify-center shadow-xs">
                  <ChefHat className="w-5 h-5 text-[#FAF8F3]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-editorial text-lg font-bold text-[#24251F]">
                      Culina AI Sous Chef
                    </h2>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#557A46]/10 text-[#557A46] text-[10px] font-bold uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-[#77796F]">
                    Conversational Recipe & Diet Advisor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Reset Chat"
                  className="p-2 text-[#77796F] hover:text-[#24251F] hover:bg-[#24251F]/5 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#77796F] hover:text-[#24251F] hover:bg-[#24251F]/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-[#557A46] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#557A46] text-white shadow-xs rounded-tr-xs'
                        : 'bg-white border border-[#24251F]/8 text-[#24251F] shadow-xs rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Suggested Recipe Cards inside Chat */}
                    {msg.suggestedRecipes && msg.suggestedRecipes.length > 0 && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-[#24251F]/6">
                        {msg.suggestedRecipes.map((recipe) => {
                          const favorited = isFavorite(recipe.id)
                          const inGrocery = groceryList.some((item) =>
                            item.recipeIds.includes(recipe.id)
                          )

                          return (
                            <div
                              key={recipe.id}
                              className="bg-[#FAF8F3] rounded-xl overflow-hidden border border-[#24251F]/8 shadow-2xs flex flex-col"
                            >
                              <div className="relative aspect-16/9 bg-black/10 overflow-hidden">
                                <img
                                  src={recipe.image}
                                  alt={recipe.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                                    <Clock className="w-3 h-3 text-[#E6A45B]" />
                                    {recipe.readyInMinutes}m
                                  </span>
                                  {recipe.calories && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                                      <Flame className="w-3 h-3 text-[#E6A45B]" />
                                      {recipe.calories} kcal
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="p-3 space-y-2">
                                <h3
                                  onClick={() => {
                                    onSelectRecipe(recipe)
                                    setIsOpen(false)
                                  }}
                                  className="font-editorial text-sm font-bold text-[#24251F] hover:text-[#557A46] cursor-pointer line-clamp-1"
                                >
                                  {recipe.title}
                                </h3>

                                <div className="flex items-center justify-between pt-1 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectRecipe(recipe)
                                      setIsOpen(false)
                                    }}
                                    className="font-semibold text-[#557A46] hover:underline"
                                  >
                                    View Steps →
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => addRecipeToGroceryList(recipe)}
                                      className={`p-1.5 rounded-md transition-colors ${
                                        inGrocery
                                          ? 'bg-[#557A46] text-white'
                                          : 'bg-white text-[#24251F] hover:bg-[#557A46]/10'
                                      }`}
                                      title={inGrocery ? 'In Grocery List' : 'Add ingredients to Grocery List'}
                                    >
                                      {inGrocery ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <PlusCircle className="w-3.5 h-3.5 text-[#557A46]" />
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite(recipe)}
                                      className={`p-1.5 rounded-md transition-colors ${
                                        favorited
                                          ? 'bg-white text-[#557A46]'
                                          : 'bg-white text-[#77796F] hover:text-[#557A46]'
                                      }`}
                                      title={favorited ? 'Saved in cookbook' : 'Save recipe'}
                                    >
                                      <Heart
                                        className={`w-3.5 h-3.5 ${
                                          favorited ? 'fill-[#557A46]' : ''
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-[#24251F]/10 text-[#24251F] flex items-center justify-center shrink-0 mt-1">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3 text-xs text-[#77796F] pl-1">
                  <div className="w-8 h-8 rounded-xl bg-[#557A46] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#24251F]/8 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#557A46] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#557A46] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#557A46] animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[11px] font-medium text-[#77796F]">
                      Curating recommendations...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="p-3 bg-white/70 border-t border-[#24251F]/6 overflow-x-auto flex items-center gap-2 no-scrollbar">
              <span className="text-[11px] font-medium text-[#77796F] shrink-0">
                Inspirations:
              </span>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] hover:bg-[#557A46]/10 hover:text-[#557A46] text-[#24251F] text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 border border-[#24251F]/6"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-white border-t border-[#24251F]/8">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your craving, time limit, or ingredients..."
                  className="flex-1 bg-[#FAF8F3] border border-[#24251F]/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#24251F] placeholder:text-[#77796F]/70 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-[#557A46] hover:bg-[#456538] text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

