import { FoodMoodData } from "./types.js";

// Local food mood database for testing
export const foodMoodDatabase: Record<string, FoodMoodData> = {
  "matcha latte with oat milk": {
    nutrients: {
      caffeine: 70, // mg
      lTheanine: 20, // mg
      carbohydrates: 15, // g
      protein: 3, // g
      antioxidants: "high",
    },
    moodEffects: {
      alertness: "increased",
      relaxation: "enhanced",
      anxiety: "reduced",
      focus: "improved",
    },
    neurotransmitters: {
      dopamine: "moderate increase",
      serotonin: "slight increase",
      gaba: "enhanced",
    },
  },
  banana: {
    nutrients: {
      potassium: 400, // mg
      vitaminB6: 0.4, // mg
      tryptophan: 0.01, // g
      carbohydrates: 27, // g
      magnesium: 32, // mg
    },
    moodEffects: {
      happiness: "increased",
      stress: "reduced",
      energy: "sustained",
      sleep: "improved",
    },
    neurotransmitters: {
      serotonin: "increased",
      melatonin: "enhanced",
      dopamine: "moderate increase",
    },
  },
  "dark chocolate": {
    nutrients: {
      magnesium: 64, // mg
      iron: 3.3, // mg
      flavonoids: "high",
      caffeine: 12, // mg
      theobromine: 200, // mg
    },
    moodEffects: {
      happiness: "significantly increased",
      stress: "reduced",
      anxiety: "decreased",
      pleasure: "enhanced",
    },
    neurotransmitters: {
      endorphins: "increased",
      serotonin: "boosted",
      dopamine: "enhanced",
    },
  },
};
