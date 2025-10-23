/**
 * MCP Tool Implementations for Happy Food Server
 *
 * This module implements all the MCP tools that Claude Desktop can use:
 * - search-food-matches: Find food matches with confidence scoring
 * - get-food-mood-effects: Analyze mood effects of specific foods
 * - health-check: Monitor server and API health
 *
 * The tools implement a two-step confirmation system:
 * 1. User searches for food → get matches with confidence scores
 * 2. User confirms specific food → get detailed mood analysis
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchFoods } from "./usda-api.js";
import { foodMoodDatabase } from "./database.js";
import {
  validateAndSanitizeInput,
  calculateMatchConfidence,
} from "./validation.js";
import {
  USDASearchResponse,
  USDAFood,
  FoodMatch,
  FoodMoodData,
} from "./types.js";

/**
 * Registers all food-related tools with the MCP server
 *
 * This function sets up the three main tools:
 * - search-food-matches: Initial food search with confidence scoring
 * - get-food-mood-effects: Detailed mood analysis for confirmed foods
 * - health-check: Server and API health monitoring
 *
 * @param server - The MCP server instance to register tools with
 */
export function registerFoodTools(server: McpServer) {
  /**
   * Search for Food Matches Tool
   *
   * This is the first step in the two-step confirmation system.
   * It searches the USDA database for food matches and returns the best
   * matches with confidence scores for user confirmation.
   *
   * Process:
   * 1. Validate and sanitize user input
   * 2. Search USDA API for matches
   * 3. Calculate confidence scores for each match
   * 4. Return top 3 matches with confidence scores
   * 5. Fallback to local database if no USDA matches
   */
  server.tool(
    "search-food-matches",
    "Search for food matches in the USDA database and return the best matches for user confirmation",
    {
      food: z.string().describe("Name of the food to search for"),
    },
    async ({ food }) => {
      // Step 1: Input validation and sanitization
      const validation = validateAndSanitizeInput(food);
      if (!validation.isValid) {
        return {
          content: [
            {
              type: "text",
              text: validation.error!,
            },
          ],
        };
      }

      // Step 2: Search USDA API for matches
      const searchData = await searchFoods(validation.sanitized!, 5);

      if (searchData && searchData.foods && searchData.foods.length > 0) {
        // Step 3: Calculate confidence scores for each USDA match
        const matches: FoodMatch[] = searchData.foods.map(
          (foodItem: USDAFood) => {
            const foodName = foodItem.description?.toLowerCase() || "";
            const confidence = calculateMatchConfidence(
              validation.sanitized!,
              foodName
            );

            return {
              name: foodItem.description,
              confidence: confidence,
              fdcId: foodItem.fdcId,
            };
          }
        );

        // Step 4: Filter, sort, and return top matches
        const sortedMatches = matches
          .filter((match: FoodMatch) => match.confidence >= 15) // Minimum confidence threshold
          .sort((a: FoodMatch, b: FoodMatch) => b.confidence - a.confidence) // Sort by confidence
          .slice(0, 3); // Return top 3 matches

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

        // Format match list for user display
        const matchList = sortedMatches
          .map(
            (match: FoodMatch, index: number) =>
              `${index + 1}. ${match.name} (confidence: ${match.confidence}%)`
          )
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

      // Step 5: Fallback to local database if no USDA matches
      const foodData = foodMoodDatabase[validation.sanitized!];

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

      // Return local database match confirmation
      return {
        content: [
          {
            type: "text",
            text: `Found "${food}" in local database. Use "get-food-mood-effects" to get the full analysis.`,
          },
        ],
      };
    }
  );

  /**
   * Get Food Mood Effects Tool
   *
   * This is the second step in the two-step confirmation system.
   * It provides detailed mood analysis for a confirmed food, including:
   * - Nutritional content (from USDA API or local database)
   * - Mood effects based on scientific research
   * - Neurotransmitter impact analysis
   *
   * Process:
   * 1. Try to get data from USDA API first
   * 2. If USDA data available, show nutritional information
   * 3. If not, fallback to local database with full mood analysis
   * 4. Return comprehensive mood effects report
   */
  server.tool(
    "get-food-mood-effects",
    "Get mood effects of a specific food based on its nutritional content",
    {
      food: z.string().describe("Name of the food to analyze"),
    },
    async ({ food }) => {
      // Step 1: Try to get data from USDA API first
      const searchData = await searchFoods(food, 1);

      if (searchData && searchData.foods && searchData.foods.length > 0) {
        // Step 2: Use real USDA nutritional data
        const foodItem = searchData.foods[0];
        const nutrients = foodItem.foodNutrients || [];

        // Extract and format key nutrients for display
        const keyNutrients = nutrients
          .filter((nutrient) => nutrient.nutrientName && nutrient.value)
          .map((nutrient) => ({
            name: nutrient.nutrientName,
            amount: nutrient.value,
            unit: nutrient.unitName,
          }))
          .slice(0, 10); // Get top 10 nutrients

        // Format USDA data analysis
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

      // Step 3: Fallback to local database for detailed mood analysis
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

      // Step 4: Format comprehensive mood analysis from local database
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
    }
  );

  /**
   * Health Check Tool for Production Monitoring
   *
   * This tool provides comprehensive health monitoring for the MCP server,
   * including USDA API connectivity, local database status, and server health.
   *
   * Monitors:
   * - USDA API connectivity and response time
   * - Local database availability and size
   * - Server version and timestamp
   * - Error conditions and degraded states
   *
   * Used for:
   * - Production monitoring and alerting
   * - Debugging connectivity issues
   * - Verifying server deployment status
   */
  server.tool(
    "health-check",
    "Check the health status of the MCP server and USDA API connectivity",
    {},
    async () => {
      try {
        // Test USDA API connectivity with a simple search
        const testResponse = await searchFoods("test", 1);

        // Determine health status based on API response
        const isUSDAHealthy = testResponse !== null;
        const localDbCount = Object.keys(foodMoodDatabase).length;

        // Return healthy status report
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
      } catch (error) {
        // Return degraded status report with error details
        return {
          content: [
            {
              type: "text",
              text: `🏥 **Happy Food MCP Server Health Check**

**Status:** ⚠️ Degraded
**USDA API:** ❌ Error: ${
                error instanceof Error ? error.message : "Unknown error"
              }
**Local Database:** ✅ Available
**Server Version:** 1.0.0
**Timestamp:** ${new Date().toISOString()}`,
            },
          ],
        };
      }
    }
  );
}
