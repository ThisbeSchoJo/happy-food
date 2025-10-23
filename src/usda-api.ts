/**
 * USDA FoodData Central API Integration
 *
 * This module handles all interactions with the USDA FoodData Central API,
 * including rate limiting, error handling, and request management.
 *
 * The USDA API provides comprehensive nutritional data for thousands of foods,
 * which we use as the primary source for food analysis.
 */

import { USDASearchResponse } from "./types.js";

/**
 * USDA API Configuration
 *
 * API Key: Retrieved from environment variable for security
 * Base URL: Official USDA FoodData Central API endpoint
 */
const USDA_API_KEY =
  process.env.USDA_API_KEY || "DaE4Ljcov428VPj5A9930A2eZ0u4cFkMv9UdUt05";
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";

/**
 * Configuration validation on startup
 * Warns if using demo key instead of production API key
 */
if (!USDA_API_KEY || USDA_API_KEY === "DEMO_KEY") {
  console.warn(
    "⚠️  Warning: Using demo API key. Set USDA_API_KEY environment variable for production."
  );
}

/**
 * Rate Limiting Configuration
 *
 * Implements a sliding window rate limiter to prevent API abuse
 * and ensure we stay within USDA API limits.
 */
const requestQueue: number[] = []; // Timestamps of recent requests
const RATE_LIMIT_WINDOW = 60000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Maximum requests per window

/**
 * Generic USDA API request handler with rate limiting and error handling
 *
 * @param endpoint - API endpoint path (e.g., "/foods/search")
 * @returns Promise resolving to API response or null on error
 */
export async function makeUSDARequest<T>(endpoint: string): Promise<T | null> {
  const now = Date.now();

  // Clean old requests from queue (sliding window approach)
  while (requestQueue.length > 0 && requestQueue[0] < now - RATE_LIMIT_WINDOW) {
    requestQueue.shift();
  }

  // Check if we've exceeded rate limit
  if (requestQueue.length >= MAX_REQUESTS_PER_WINDOW) {
    console.error("Rate limit exceeded for USDA API");
    return null;
  }

  // Add current request timestamp to queue
  requestQueue.push(now);

  // Construct full API URL with authentication
  const url = `${USDA_API_BASE}${endpoint}&api_key=${USDA_API_KEY}`;

  try {
    // Set up request timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Make HTTP request with proper headers
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Happy-Food-MCP-Server/1.0.0",
      },
    });

    // Clear timeout since request completed
    clearTimeout(timeoutId);

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return JSON response
    return (await response.json()) as T;
  } catch (error) {
    // Log error details for debugging
    console.error("Error making USDA request:", error);

    // Log structured error for production monitoring
    console.error(
      `USDA API Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return null;
  }
}

/**
 * Search for foods in the USDA database
 *
 * @param query - Food name to search for
 * @param pageSize - Number of results to return (default: 5)
 * @returns Promise resolving to search results or null on error
 */
export async function searchFoods(
  query: string,
  pageSize: number = 5
): Promise<USDASearchResponse | null> {
  // Construct search endpoint with query parameters
  const endpoint = `/foods/search?query=${encodeURIComponent(
    query
  )}&pageSize=${pageSize}`;

  // Make request and return results
  return await makeUSDARequest<USDASearchResponse>(endpoint);
}
