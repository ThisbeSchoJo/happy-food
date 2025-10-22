import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// const NWS_API_BASE = "https://api.food.gov";
// const USER_AGENT = "happy-food-app/1.0";
// Create server instance
const server = new McpServer({
    name: "happy-food",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Helper function for making NWS API requests
// async function makeNWSRequest<T>(url: string): Promise<T | null> {
//     const headers = {
//       "User-Agent": USER_AGENT,
//       Accept: "application/geo+json",
//     };
//     try {
//       const response = await fetch(url, { headers });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return (await response.json()) as T;
//     } catch (error) {
//       console.error("Error making NWS request:", error);
//       return null;
//     }
//   }
// USDA API configuration
const USDA_API_KEY = process.env.USDA_API_KEY || "DaE4Ljcov428VPj5A9930A2eZ0u4cFkMv9UdUt05"; // Replace with your actual API key
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
// Helper function for making USDA API requests
async function makeUSDARequest(endpoint) {
    const url = `${USDA_API_BASE}${endpoint}&api_key=${USDA_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making USDA request:", error);
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
// interface AlertFeature {
//   properties: {
//     event?: string;
//     areaDesc?: string;
//     severity?: string;
//     status?: string;
//     headline?: string;
//   };
// }
// // Format alert data
// function formatAlert(feature: AlertFeature): string {
//   const props = feature.properties;
//   return [
//     `Event: ${props.event || "Unknown"}`,
//     `Area: ${props.areaDesc || "Unknown"}`,
//     `Severity: ${props.severity || "Unknown"}`,
//     `Status: ${props.status || "Unknown"}`,
//     `Headline: ${props.headline || "No headline"}`,
//     "---",
//   ].join("\n");
// }
// interface ForecastPeriod {
//   name?: string;
//   temperature?: number;
//   temperatureUnit?: string;
//   windSpeed?: string;
//   windDirection?: string;
//   shortForecast?: string;
// }
// interface AlertsResponse {
//   features: AlertFeature[];
// }
// interface PointsResponse {
//   properties: {
//     forecast?: string;
//   };
// }
// interface ForecastResponse {
//   properties: {
//     periods: ForecastPeriod[];
//   };
// }
// Register food tools
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
                    text: `Sorry, I couldn't find "${food}" in the USDA database or my local database. Try: "matcha latte with oat milk", "banana", or "dark chocolate"`,
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
// Register weather tools
// server.tool(
//     "get-alerts",
//     "Get weather alerts for a state",
//     {
//       state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
//     },
//     async ({ state }) => {
//       const stateCode = state.toUpperCase();
//       const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
//       const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);
//       if (!alertsData) {
//         return {
//           content: [
//             {
//               type: "text",
//               text: "Failed to retrieve alerts data",
//             },
//           ],
//         };
//       }
//       const features = alertsData.features || [];
//       if (features.length === 0) {
//         return {
//           content: [
//             {
//               type: "text",
//               text: `No active alerts for ${stateCode}`,
//             },
//           ],
//         };
//       }
//       const formattedAlerts = features.map(formatAlert);
//       const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;
//       return {
//         content: [
//           {
//             type: "text",
//             text: alertsText,
//           },
//         ],
//       };
//     },
//   );
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
// server.tool(
//   "get-forecast",
//   "Get weather forecast for a location",
//   {
//     latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
//     longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
//   },
//   async ({ latitude, longitude }) => {
//     // Get grid point data
//     const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
//     const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);
//     if (!pointsData) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
//           },
//         ],
//       };
//     }
//     const forecastUrl = pointsData.properties?.forecast;
//     if (!forecastUrl) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: "Failed to get forecast URL from grid point data",
//           },
//         ],
//       };
//     }
//     // Get forecast data
//     const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
//     if (!forecastData) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: "Failed to retrieve forecast data",
//           },
//         ],
//       };
//     }
//     const periods = forecastData.properties?.periods || [];
//     if (periods.length === 0) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: "No forecast periods available",
//           },
//         ],
//       };
//     }
//     // Format forecast periods
//     const formattedForecast = periods.map((period: ForecastPeriod) =>
//       [
//         `${period.name || "Unknown"}:`,
//         `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
//         `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
//         `${period.shortForecast || "No forecast available"}`,
//         "---",
//       ].join("\n"),
//     );
//     const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
//     return {
//       content: [
//         {
//           type: "text",
//           text: forecastText,
//         },
//       ],
//     };
//   },
// );
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Happy Food MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
