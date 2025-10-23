// TypeScript interfaces for USDA API responses
export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  derivationCode: string;
  derivationDescription: string;
  derivationId: number;
  value: number;
  foodNutrientSourceId: number;
  foodNutrientSourceCode: string;
  foodNutrientSourceDescription: string;
  rank: number;
  indentLevel: number;
  foodNutrientId: number;
  percentDailyValue?: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: USDANutrient[];
}

export interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export interface FoodMatch {
  name: string;
  confidence: number;
  fdcId: number;
}

// Local database interfaces
export interface FoodNutrients {
  [key: string]: string | number;
}

export interface MoodEffects {
  [key: string]: string;
}

export interface Neurotransmitters {
  [key: string]: string;
}

export interface FoodMoodData {
  nutrients: FoodNutrients;
  moodEffects: MoodEffects;
  neurotransmitters: Neurotransmitters;
}
