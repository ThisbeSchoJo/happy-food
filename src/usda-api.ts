import { USDASearchResponse } from "./types.js";

// USDA API configuration
const USDA_API_KEY =
  process.env.USDA_API_KEY || "DaE4Ljcov428VPj5A9930A2eZ0u4cFkMv9UdUt05";
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";

// Validate configuration on startup
if (!USDA_API_KEY || USDA_API_KEY === "DEMO_KEY") {
  console.warn(
    "⚠️  Warning: Using demo API key. Set USDA_API_KEY environment variable for production."
  );
}

// Rate limiting protection
const requestQueue: number[] = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

export async function makeUSDARequest<T>(endpoint: string): Promise<T | null> {
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
        "User-Agent": "Happy-Food-MCP-Server/1.0.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making USDA request:", error);
    // Log to stderr for production monitoring
    console.error(
      `USDA API Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return null;
  }
}

export async function searchFoods(
  query: string,
  pageSize: number = 5
): Promise<USDASearchResponse | null> {
  const endpoint = `/foods/search?query=${encodeURIComponent(
    query
  )}&pageSize=${pageSize}`;
  return await makeUSDARequest<USDASearchResponse>(endpoint);
}
