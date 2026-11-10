import React from 'react'

export const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#24251F]/8 shadow-xs animate-pulse flex flex-col justify-between">
      <div>
        {/* Image skeleton */}
        <div className="w-full aspect-16/10 bg-[#24251F]/6" />

        <div className="p-5 space-y-3">
          {/* Badge skeleton */}
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-[#24251F]/6 rounded-md" />
            <div className="h-4 w-20 bg-[#24251F]/6 rounded-md" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-1.5 pt-1">
            <div className="h-5 w-5/6 bg-[#24251F]/10 rounded-md" />
            <div className="h-5 w-3/5 bg-[#24251F]/10 rounded-md" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-1 pt-2">
            <div className="h-3 w-full bg-[#24251F]/6 rounded" />
            <div className="h-3 w-4/5 bg-[#24251F]/6 rounded" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="px-5 pb-5 pt-3 border-t border-[#24251F]/6 flex justify-between items-center">
        <div className="h-4 w-24 bg-[#24251F]/6 rounded" />
        <div className="h-8 w-24 bg-[#24251F]/6 rounded-lg" />
      </div>
    </div>
  )
}

export const RecipeGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <RecipeCardSkeleton key={idx} />
      ))}
    </div>
  )
}

