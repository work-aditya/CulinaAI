// NLP Query Preprocessor: Tokenization, Stop-word removal & Semantic Intent Extraction

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having',
  'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its',
  'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d',
  'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Conversational recipe fillers
  'make', 'cook', 'cooking', 'want', 'craving', 'like', 'find', 'looking', 'something', 'recipe', 'recipes', 'dinner',
  'lunch', 'breakfast', 'meal', 'meals', 'dish', 'dishes', 'good', 'delicious', 'tasty', 'easy', 'simple', 'please',
])

const KNOWN_CUISINES = [
  'italian', 'mexican', 'mediterranean', 'indian', 'japanese', 'chinese', 'thai', 'french', 'greek', 'nordic', 'american'
]

const KNOWN_INGREDIENTS = [
  'salmon', 'pasta', 'chicken', 'beef', 'avocado', 'spinach', 'kale', 'cauliflower', 'garlic', 'rice', 'lentils',
  'chickpeas', 'tomato', 'tomatoes', 'sweet potato', 'potato', 'onion', 'tofu', 'egg', 'eggs', 'cheese', 'parmesan',
  'mushroom', 'mushrooms', 'lemon', 'coconut milk', 'curry'
]

export interface ParsedSearchIntent {
  originalQuery: string
  tokens: string[]
  keywords: string[]
  detectedCuisines: string[]
  detectedIngredients: string[]
  inferredDiet?: string
  inferredMaxTime?: number
}

export function parseNaturalLanguageQuery(query: string): ParsedSearchIntent {
  if (!query.trim()) {
    return {
      originalQuery: query,
      tokens: [],
      keywords: [],
      detectedCuisines: [],
      detectedIngredients: [],
    }
  }

  const rawLower = query.toLowerCase()

  // 1. Tokenize by words and remove punctuation
  const tokens = rawLower
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  // 2. Filter stop words for core semantic keywords
  const keywords = tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 1)

  // 3. Detect known cuisines
  const detectedCuisines = KNOWN_CUISINES.filter((cuisine) =>
    rawLower.includes(cuisine)
  )

  // 4. Detect known ingredients
  const detectedIngredients = KNOWN_INGREDIENTS.filter((ing) =>
    rawLower.includes(ing)
  )

  // 5. Infer diet constraints
  let inferredDiet: string | undefined
  if (rawLower.includes('vegan')) inferredDiet = 'vegan'
  else if (rawLower.includes('vegetarian') || rawLower.includes('veggie')) inferredDiet = 'vegetarian'
  else if (rawLower.includes('gluten free') || rawLower.includes('gluten-free')) inferredDiet = 'gluten free'
  else if (rawLower.includes('keto') || rawLower.includes('low carb')) inferredDiet = 'ketogenic'
  else if (rawLower.includes('pescetarian') || rawLower.includes('pescatarian')) inferredDiet = 'pescetarian'

  // 6. Infer time constraints
  let inferredMaxTime: number | undefined
  if (rawLower.includes('quick') || rawLower.includes('fast') || rawLower.includes('speedy') || rawLower.includes('weeknight')) {
    inferredMaxTime = 30
  }
  const minMatch = rawLower.match(/under\s+(\d+)\s*(mins?|minutes?)/)
  if (minMatch && minMatch[1]) {
    inferredMaxTime = parseInt(minMatch[1], 10)
  }

  return {
    originalQuery: query,
    tokens,
    keywords,
    detectedCuisines,
    detectedIngredients,
    inferredDiet,
    inferredMaxTime,
  }
}

