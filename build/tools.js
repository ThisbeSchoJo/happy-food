import { z } from "zod";
import { searchFoods } from "./usda-api.js";
import { foodMoodDatabase } from "./database.js";
import { validateAndSanitizeInput, calculateMatchConfidence, } from "./validation.js";
export function registerFoodTools(server) {
    // Search for food matches tool
    server.tool("search-food-matches", "Search for food matches in the USDA database and return the best matches for user confirmation", {
        food: z.string().describe("Name of the food to search for"),
    }, async ({ food }) => {
        // Input validation and sanitization
        const validation = validateAndSanitizeInput(food);
        if (!validation.isValid) {
            return {
                content: [
                    {
                        type: "text",
                        text: validation.error,
                    },
                ],
            };
        }
        // Search USDA API for matches
        const searchData = await searchFoods(validation.sanitized, 5);
        if (searchData && searchData.foods && searchData.foods.length > 0) {
            // Calculate confidence for each match
            const matches = searchData.foods.map((foodItem) => {
                const foodName = foodItem.description?.toLowerCase() || "";
                const confidence = calculateMatchConfidence(validation.sanitized, foodName);
                return {
                    name: foodItem.description,
                    confidence: confidence,
                    fdcId: foodItem.fdcId,
                };
            });
            // Sort by confidence and return top matches
            const sortedMatches = matches
                .filter((match) => match.confidence >= 15)
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 3);
            if (sortedMatches.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No good matches found for "${food}". Please try a different food name or check the spelling.`,
                        },
                    ],
                };
            }
            const matchList = sortedMatches
                .map((match, index) => `${index + 1}. ${match.name} (confidence: ${match.confidence}%)`)
                .join("\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `Found ${sortedMatches.length} potential matches for "${food}":\n\n${matchList}\n\nPlease use the "get-food-mood-effects" tool with the exact food name you want to analyze.`,
                    },
                ],
            };
        }
        // Fallback to local database
        const foodData = foodMoodDatabase[validation.sanitized];
        if (!foodData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Sorry, I couldn't find "${food}" in the USDA database or my local database. Try: "matcha latte with oat milk", "banana", or "dark chocolate"`,
                    },
                ],
            };
        }
        // Return local database match
        return {
            content: [
                {
                    type: "text",
                    text: `Found "${food}" in local database. Use "get-food-mood-effects" to get the full analysis.`,
                },
            ],
        };
    });
    // Get food mood effects tool
    server.tool("get-food-mood-effects", "Get mood effects of a specific food based on its nutritional content", {
        food: z.string().describe("Name of the food to analyze"),
    }, async ({ food }) => {
        // First try to get data from USDA API
        const searchData = await searchFoods(food, 1);
        if (searchData && searchData.foods && searchData.foods.length > 0) {
            // Use real USDA data
            const foodItem = searchData.foods[0];
            const nutrients = foodItem.foodNutrients || [];
            // Extract key nutrients for mood analysis
            const keyNutrients = nutrients
                .filter((nutrient) => nutrient.nutrientName && nutrient.value)
                .map((nutrient) => ({
                name: nutrient.nutrientName,
                amount: nutrient.value,
                unit: nutrient.unitName,
            }))
                .slice(0, 10); // Get top 10 nutrients
            const analysis = `🍽️ **Mood Effects of ${food}** (from USDA database)

**Key Nutrients:**
${keyNutrients.map((n) => `• ${n.name}: ${n.amount} ${n.unit}`).join("\n")}

**Note:** This is real nutritional data from the USDA database. For detailed mood analysis, we would need to map these nutrients to their effects on neurotransmitters and mood.`;
            return {
                content: [
                    {
                        type: "text",
                        text: analysis,
                    },
                ],
            };
        }
        // Fallback to local database
        const foodData = foodMoodDatabase[food.toLowerCase()];
        if (!foodData) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Sorry, I couldn't find "${food}" in the USDA database or my local database. Try using "search-food-matches" first to find the right food name.`,
                    },
                ],
            };
        }
        // Format the mood analysis from local database
        const analysis = `🍽️ **Mood Effects of ${food}** (from local database)

**Key Nutrients:**
${Object.entries(foodData.nutrients)
            .map(([nutrient, value]) => `• ${nutrient}: ${value}`)
            .join("\n")}

**Mood Effects:**
${Object.entries(foodData.moodEffects)
            .map(([effect, change]) => `• ${effect}: ${change}`)
            .join("\n")}

**Neurotransmitter Impact:**
${Object.entries(foodData.neurotransmitters)
            .map(([neurotransmitter, effect]) => `• ${neurotransmitter}: ${effect}`)
            .join("\n")}`;
        return {
            content: [
                {
                    type: "text",
                    text: analysis,
                },
            ],
        };
    });
    // Health check tool for production monitoring
    server.tool("health-check", "Check the health status of the MCP server and USDA API connectivity", {}, async () => {
        try {
            // Test USDA API connectivity
            const testResponse = await searchFoods("test", 1);
            const isUSDAHealthy = testResponse !== null;
            const localDbCount = Object.keys(foodMoodDatabase).length;
            return {
                content: [
                    {
                        type: "text",
                        text: `🏥 **Happy Food MCP Server Health Check**

**Status:** ✅ Healthy
**USDA API:** ${isUSDAHealthy ? "✅ Connected" : "❌ Disconnected"}
**Local Database:** ✅ ${localDbCount} foods available
**Server Version:** 1.0.0
**Timestamp:** ${new Date().toISOString()}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🏥 **Happy Food MCP Server Health Check**

**Status:** ⚠️ Degraded
**USDA API:** ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
**Local Database:** ✅ Available
**Server Version:** 1.0.0
**Timestamp:** ${new Date().toISOString()}`,
                    },
                ],
            };
        }
    });
}
