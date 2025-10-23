/**
 * TypeScript interfaces for the Happy Food MCP Server
 *
 * This file defines all the data structures used throughout the application,
 * including USDA API responses and local database schemas.
 */

/**
 * Individual nutrient data from USDA FoodData Central API
 * Contains detailed nutritional information for each nutrient in a food item
 */
export interface USDANutrient {
  nutrientId: number; // Unique USDA nutrient identifier
  nutrientName: string; // Human-readable nutrient name (e.g., "Protein")
  nutrientNumber: string; // USDA nutrient number (e.g., "203")
  unitName: string; // Unit of measurement (e.g., "G", "MG")
  derivationCode: string; // How the value was derived
  derivationDescription: string; // Description of derivation method
  derivationId: number; // Unique derivation identifier
  value: number; // Actual nutrient amount
  foodNutrientSourceId: number; // Source of the nutrient data
  foodNutrientSourceCode: string; // Code for the data source
  foodNutrientSourceDescription: string; // Description of the data source
  rank: number; // Ranking of nutrient importance
  indentLevel: number; // Indentation level for display
  foodNutrientId: number; // Unique food-nutrient relationship ID
  percentDailyValue?: number; // Optional daily value percentage
}

/**
 * Complete food item from USDA API with all nutritional data
 * Represents a single food item with its complete nutrient profile
 */
export interface USDAFood {
  fdcId: number; // Unique USDA food identifier
  description: string; // Food name/description
  dataType: string; // Type of data (e.g., "Foundation", "SR Legacy")
  foodNutrients: USDANutrient[]; // Array of all nutrients in this food
}

/**
 * Response structure from USDA FoodData Central search API
 * Contains search results and pagination information
 */
export interface USDASearchResponse {
  foods: USDAFood[]; // Array of matching food items
  totalHits: number; // Total number of matches found
  currentPage: number; // Current page number
  totalPages: number; // Total number of pages available
}

/**
 * Internal food match structure with confidence scoring
 * Used for presenting search results to users with match quality
 */
export interface FoodMatch {
  name: string; // Food name for display
  confidence: number; // Match confidence score (0-100)
  fdcId: number; // USDA food identifier for lookup
}

/**
 * Local database interfaces for mood analysis
 * These define the structure of our curated food mood database
 */

/**
 * Flexible nutrient data structure for local database
 * Supports both numeric values and descriptive strings
 */
export interface FoodNutrients {
  [key: string]: string | number; // Nutrient name -> value mapping
}

/**
 * Mood effects mapping for local database
 * Describes how a food affects various mood states
 */
export interface MoodEffects {
  [key: string]: string; // Mood aspect -> effect description
}

/**
 * Neurotransmitter impact mapping for local database
 * Describes how a food affects brain chemistry
 */
export interface Neurotransmitters {
  [key: string]: string; // Neurotransmitter -> effect description
}

/**
 * Complete food mood analysis data structure
 * Combines nutritional, mood, and neurotransmitter information
 */
export interface FoodMoodData {
  nutrients: FoodNutrients; // Nutritional content
  moodEffects: MoodEffects; // Mood impact descriptions
  neurotransmitters: Neurotransmitters; // Brain chemistry effects
}
