import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create server instance
const server = new McpServer({
    name: "happy-food",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// USDA API configuration
const USDA_API_KEY = process.env.USDA_API_KEY || "DaE4Ljcov428VPj5A9930A2eZ0u4cFkMv9UdUt05"; // Replace with your actual API key
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
// Validate configuration on startup
if (!USDA_API_KEY || USDA_API_KEY === "DEMO_KEY") {
    console.warn("⚠️  Warning: Using demo API key. Set USDA_API_KEY environment variable for production.");
}
// Rate limiting protection
const requestQueue = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
async function makeUSDARequest(endpoint) {
    const now = Date.now();
    // Clean old requests from queue
    while (requestQueue.length > 0 && requestQueue[0] < now - RATE_LIMIT_WINDOW) {
        requestQueue.shift();
    }
    // Check rate limit
    if (requestQueue.length >= MAX_REQUESTS_PER_WINDOW) {
        console.error("Rate limit exceeded for USDA API");
        return null;
    }
    // Add current request to queue
    requestQueue.push(now);
    const url = `${USDA_API_BASE}${endpoint}&api_key=${USDA_API_KEY}`;
    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Happy-Food-MCP-Server/1.0.0'
            }
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making USDA request:", error);
        // Log to stderr for production monitoring
        console.error(`USDA API Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        return null;
    }
}
// Local food mood database for testing
const foodMoodDatabase = {
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
// Register food tools
server.tool("search-food-matches", "Search for food matches in the USDA database and return the best matches for user confirmation", {
    food: z.string().describe("Name of the food to search for"),
}, async ({ food }) => {
    // Input validation and sanitization
    if (!food || typeof food !== 'string' || food.trim().length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "Please provide a valid food name to search for.",
                },
            ],
        };
    }
    // Sanitize input
    const sanitizedFood = food.trim().toLowerCase();
    // Validate that the input looks like a real food using context analysis
    const suspiciousPatterns = [
        // Clearly non-food combinations
        /unicorn\s+(food|meat|flesh)/i,
        /gargoyle\s+(claws|wings|scales)/i,
        /dragon\s+(claws|wings|scales|blood)/i,
        /fairy\s+(dust|wings|magic)/i,
        /earwax/i,
        /hooves/i,
        /poop/i,
        /poo/i,
        /pee/i,
        /urine/i,
        /blood\s+(alone|drink)/i,
        /flesh\s+(alone|raw)/i,
        /rock\s+(alone|hard)/i,
        /stone\s+(alone|hard)/i,
        /metal\s+(alone|hard)/i,
        /plastic\s+(alone|hard)/i,
        /glass\s+(alone|hard)/i,
        /wood\s+(alone|hard)/i,
    ];
    const isSuspiciousNonFood = suspiciousPatterns.some((pattern) => pattern.test(food));
    if (isSuspiciousNonFood) {
        return {
            content: [
                {
                    type: "text",
                    text: `Sorry, "${food}" doesn't appear to be a real food. Please try asking about actual foods like "banana", "apple", "chicken", "rice", etc.`,
                },
            ],
        };
    }
    // Search USDA API for matches
    const searchEndpoint = `/foods/search?query=${encodeURIComponent(food)}&pageSize=5`;
    const searchData = await makeUSDARequest(searchEndpoint);
    if (searchData && searchData.foods && searchData.foods.length > 0) {
        // Calculate confidence for each match
        const matches = searchData.foods.map((foodItem) => {
            const foodName = foodItem.description?.toLowerCase() || "";
            const searchTerm = food.toLowerCase();
            const searchWords = searchTerm
                .split(" ")
                .filter((word) => word.length > 2);
            let confidence = 0;
            // Exact match gets highest score
            if (foodName.includes(searchTerm)) {
                confidence += 50;
            }
            // Word-by-word matching with fuzzy tolerance
            searchWords.forEach((word) => {
                if (foodName.includes(word)) {
                    confidence += 20; // Exact word match
                }
                else {
                    // Fuzzy matching for typos (allows 1-2 character differences)
                    const fuzzyMatch = foodName
                        .split(" ")
                        .some((foodWord) => {
                        if (Math.abs(word.length - foodWord.length) > 2)
                            return false;
                        // Simple Levenshtein-like distance check
                        let differences = 0;
                        const minLength = Math.min(word.length, foodWord.length);
                        for (let i = 0; i < minLength; i++) {
                            if (word[i] !== foodWord[i])
                                differences++;
                        }
                        differences += Math.abs(word.length - foodWord.length);
                        return differences <= 2; // Allow up to 2 character differences
                    });
                    if (fuzzyMatch) {
                        confidence += 10; // Fuzzy match
                    }
                }
            });
            // Bonus for common food indicators
            const foodIndicators = [
                "food",
                "fruit",
                "vegetable",
                "meat",
                "dairy",
                "grain",
                "nut",
                "seed",
                "spice",
                "herb",
            ];
            if (foodIndicators.some((indicator) => foodName.includes(indicator))) {
                confidence += 5;
            }
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
    const foodData = foodMoodDatabase[food.toLowerCase()];
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
server.tool("get-food-mood-effects", "Get mood effects of a specific food based on its nutritional content", {
    food: z.string().describe("Name of the food to analyze"),
}, async ({ food }) => {
    // First try to get data from USDA API
    const searchEndpoint = `/foods/search?query=${encodeURIComponent(food)}&pageSize=1`;
    const searchData = await makeUSDARequest(searchEndpoint);
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
        const testEndpoint = `/foods/search?query=test&pageSize=1`;
        const testResponse = await makeUSDARequest(testEndpoint);
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
server.tool("get-food-nutrition", "Get detailed nutritional information for a specific food", {
    food: z.string().describe("Name of the food to get nutritional data for"),
}, async ({ food }) => {
    // TODO: Implement nutrition data retrieval
    return {
        content: [
            {
                type: "text",
                text: `Nutritional data for ${food}: Coming soon!`,
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Happy Food MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
