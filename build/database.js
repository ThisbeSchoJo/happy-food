/**
 * Local Food Mood Database
 *
 * This module contains a curated database of foods with detailed mood analysis.
 * It serves as a fallback when USDA API data is unavailable and provides
 * comprehensive mood effects based on nutritional content and neurotransmitter impact.
 *
 * The database is organized by food categories and includes:
 * - Detailed nutritional information
 * - Mood effects based on scientific research
 * - Neurotransmitter impact analysis
 * - Gut-brain axis considerations
 */
/**
 * Curated food mood database with comprehensive analysis
 *
 * This database contains 22 carefully selected foods across 8 categories,
 * each with detailed nutritional data, mood effects, and neurotransmitter impact.
 *
 * Categories included:
 * - Caffeinated beverages (coffee, tea, matcha)
 * - Fruits (banana, blueberries, avocado)
 * - Nuts and seeds (almonds, walnuts, pumpkin seeds)
 * - Vegetables (spinach, sweet potato)
 * - Proteins (salmon, eggs)
 * - Grains (oats, quinoa)
 * - Fermented foods (yogurt, kimchi)
 * - Herbs and spices (turmeric, ginger)
 * - Comfort foods (dark chocolate, chicken soup, honey)
 */
export const foodMoodDatabase = {
    // Caffeinated beverages
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
    coffee: {
        nutrients: {
            caffeine: 95, // mg
            chlorogenicAcid: 200, // mg
            antioxidants: "high",
            riboflavin: 0.2, // mg
            niacin: 0.5, // mg
        },
        moodEffects: {
            alertness: "significantly increased",
            energy: "boosted",
            focus: "enhanced",
            anxiety: "may increase in sensitive individuals",
        },
        neurotransmitters: {
            dopamine: "increased",
            norepinephrine: "boosted",
            adenosine: "blocked",
        },
    },
    "green tea": {
        nutrients: {
            caffeine: 25, // mg
            lTheanine: 8, // mg
            egcg: 50, // mg
            antioxidants: "very high",
            vitaminC: 2, // mg
        },
        moodEffects: {
            calmness: "enhanced",
            focus: "improved",
            stress: "reduced",
            relaxation: "increased",
        },
        neurotransmitters: {
            gaba: "enhanced",
            alphaWaves: "increased",
            serotonin: "moderate increase",
        },
    },
    // Fruits
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
    blueberries: {
        nutrients: {
            anthocyanins: 120, // mg
            vitaminC: 14, // mg
            fiber: 3.6, // g
            antioxidants: "very high",
            manganese: 0.3, // mg
        },
        moodEffects: {
            memory: "enhanced",
            cognitiveFunction: "improved",
            inflammation: "reduced",
            brainHealth: "supported",
        },
        neurotransmitters: {
            bdnf: "increased",
            acetylcholine: "enhanced",
            dopamine: "moderate increase",
        },
    },
    avocado: {
        nutrients: {
            healthyFats: 15, // g
            fiber: 7, // g
            folate: 81, // mcg
            vitaminK: 21, // mcg
            potassium: 485, // mg
        },
        moodEffects: {
            satiety: "increased",
            brainHealth: "supported",
            energy: "sustained",
            mood: "stabilized",
        },
        neurotransmitters: {
            serotonin: "supported",
            dopamine: "moderate increase",
            acetylcholine: "enhanced",
        },
    },
    // Nuts and seeds
    almonds: {
        nutrients: {
            magnesium: 76, // mg
            vitaminE: 7.3, // mg
            protein: 6, // g
            healthyFats: 14, // g
            fiber: 3.5, // g
        },
        moodEffects: {
            stress: "reduced",
            energy: "sustained",
            brainHealth: "supported",
            anxiety: "decreased",
        },
        neurotransmitters: {
            serotonin: "supported",
            gaba: "enhanced",
            dopamine: "moderate increase",
        },
    },
    walnuts: {
        nutrients: {
            omega3: 2.5, // g
            protein: 4, // g
            magnesium: 45, // mg
            vitaminE: 0.8, // mg
            antioxidants: "high",
        },
        moodEffects: {
            brainHealth: "significantly supported",
            memory: "enhanced",
            inflammation: "reduced",
            mood: "stabilized",
        },
        neurotransmitters: {
            bdnf: "increased",
            serotonin: "supported",
            dopamine: "moderate increase",
        },
    },
    "pumpkin seeds": {
        nutrients: {
            magnesium: 150, // mg
            zinc: 2.2, // mg
            tryptophan: 0.6, // g
            protein: 5, // g
            iron: 2.3, // mg
        },
        moodEffects: {
            sleep: "improved",
            stress: "reduced",
            energy: "sustained",
            anxiety: "decreased",
        },
        neurotransmitters: {
            serotonin: "increased",
            melatonin: "enhanced",
            gaba: "supported",
        },
    },
    // Vegetables
    spinach: {
        nutrients: {
            folate: 58, // mcg
            iron: 2.7, // mg
            magnesium: 79, // mg
            vitaminK: 483, // mcg
            antioxidants: "high",
        },
        moodEffects: {
            energy: "increased",
            brainHealth: "supported",
            stress: "reduced",
            cognitiveFunction: "enhanced",
        },
        neurotransmitters: {
            serotonin: "supported",
            dopamine: "moderate increase",
            acetylcholine: "enhanced",
        },
    },
    "sweet potato": {
        nutrients: {
            betaCarotene: 14000, // mcg
            vitaminA: 1400, // mcg
            potassium: 337, // mg
            fiber: 3, // g
            vitaminC: 22, // mg
        },
        moodEffects: {
            energy: "sustained",
            mood: "stabilized",
            stress: "reduced",
            brainHealth: "supported",
        },
        neurotransmitters: {
            serotonin: "supported",
            dopamine: "moderate increase",
            acetylcholine: "enhanced",
        },
    },
    // Proteins
    salmon: {
        nutrients: {
            omega3: 1.8, // g
            protein: 25, // g
            vitaminD: 11, // mcg
            vitaminB12: 2.4, // mcg
            selenium: 40, // mcg
        },
        moodEffects: {
            brainHealth: "significantly supported",
            mood: "stabilized",
            inflammation: "reduced",
            cognitiveFunction: "enhanced",
        },
        neurotransmitters: {
            bdnf: "increased",
            serotonin: "supported",
            dopamine: "moderate increase",
        },
    },
    eggs: {
        nutrients: {
            protein: 6, // g
            choline: 147, // mg
            vitaminB12: 0.6, // mcg
            selenium: 15, // mcg
            vitaminD: 1, // mcg
        },
        moodEffects: {
            brainHealth: "supported",
            memory: "enhanced",
            energy: "sustained",
            mood: "stabilized",
        },
        neurotransmitters: {
            acetylcholine: "enhanced",
            serotonin: "supported",
            dopamine: "moderate increase",
        },
    },
    // Grains
    oats: {
        nutrients: {
            fiber: 4, // g
            protein: 5, // g
            magnesium: 61, // mg
            phosphorus: 180, // mg
            betaGlucan: 2, // g
        },
        moodEffects: {
            energy: "sustained",
            mood: "stabilized",
            stress: "reduced",
            satiety: "increased",
        },
        neurotransmitters: {
            serotonin: "supported",
            dopamine: "moderate increase",
            gaba: "enhanced",
        },
    },
    quinoa: {
        nutrients: {
            protein: 8, // g
            fiber: 5, // g
            magnesium: 118, // mg
            iron: 2.8, // mg
            folate: 78, // mcg
        },
        moodEffects: {
            energy: "sustained",
            brainHealth: "supported",
            stress: "reduced",
            mood: "stabilized",
        },
        neurotransmitters: {
            serotonin: "supported",
            dopamine: "moderate increase",
            acetylcholine: "enhanced",
        },
    },
    // Fermented foods
    "greek yogurt": {
        nutrients: {
            protein: 10, // g
            probiotics: "high",
            calcium: 100, // mg
            vitaminB12: 0.5, // mcg
            phosphorus: 135, // mg
        },
        moodEffects: {
            gutHealth: "significantly improved",
            brainHealth: "supported",
            mood: "stabilized",
            stress: "reduced",
        },
        neurotransmitters: {
            serotonin: "increased via gut-brain axis",
            gaba: "enhanced",
            dopamine: "moderate increase",
        },
    },
    kimchi: {
        nutrients: {
            probiotics: "very high",
            vitaminC: 18, // mg
            fiber: 2, // g
            antioxidants: "high",
            capsaicin: 0.1, // mg
        },
        moodEffects: {
            gutHealth: "significantly improved",
            brainHealth: "supported",
            inflammation: "reduced",
            mood: "enhanced",
        },
        neurotransmitters: {
            serotonin: "increased via gut-brain axis",
            gaba: "enhanced",
            dopamine: "moderate increase",
        },
    },
    // Herbs and spices
    turmeric: {
        nutrients: {
            curcumin: 200, // mg
            antioxidants: "very high",
            iron: 2.8, // mg
            manganese: 0.5, // mg
            fiber: 2, // g
        },
        moodEffects: {
            inflammation: "significantly reduced",
            brainHealth: "supported",
            mood: "enhanced",
            stress: "reduced",
        },
        neurotransmitters: {
            bdnf: "increased",
            serotonin: "supported",
            dopamine: "moderate increase",
        },
    },
    ginger: {
        nutrients: {
            gingerol: 50, // mg
            antioxidants: "high",
            vitaminC: 5, // mg
            magnesium: 43, // mg
            potassium: 415, // mg
        },
        moodEffects: {
            nausea: "reduced",
            inflammation: "reduced",
            energy: "increased",
            mood: "enhanced",
        },
        neurotransmitters: {
            serotonin: "supported",
            dopamine: "moderate increase",
            gaba: "enhanced",
        },
    },
    // Dark chocolate (enhanced)
    "dark chocolate": {
        nutrients: {
            magnesium: 64, // mg
            iron: 3.3, // mg
            flavonoids: "high",
            caffeine: 12, // mg
            theobromine: 200, // mg
            antioxidants: "very high",
        },
        moodEffects: {
            happiness: "significantly increased",
            stress: "reduced",
            anxiety: "decreased",
            pleasure: "enhanced",
            brainHealth: "supported",
        },
        neurotransmitters: {
            endorphins: "increased",
            serotonin: "boosted",
            dopamine: "enhanced",
            anandamide: "increased",
        },
    },
    // Comfort foods
    "chicken soup": {
        nutrients: {
            protein: 15, // g
            collagen: 2, // g
            zinc: 1.5, // mg
            selenium: 15, // mcg
            vitaminA: 200, // mcg
        },
        moodEffects: {
            comfort: "increased",
            stress: "reduced",
            immuneSystem: "supported",
            mood: "enhanced",
        },
        neurotransmitters: {
            serotonin: "increased",
            dopamine: "moderate increase",
            gaba: "enhanced",
        },
    },
    honey: {
        nutrients: {
            antioxidants: "high",
            glucose: 17, // g
            fructose: 17, // g
            enzymes: "various",
            minerals: "trace amounts",
        },
        moodEffects: {
            energy: "quick boost",
            stress: "reduced",
            sleep: "improved",
            mood: "enhanced",
        },
        neurotransmitters: {
            serotonin: "increased",
            melatonin: "enhanced",
            dopamine: "moderate increase",
        },
    },
};
