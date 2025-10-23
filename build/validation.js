/**
 * Input validation and sanitization utilities
 *
 * This module provides functions to validate user input, sanitize food names,
 * and implement confidence scoring for food matching. It helps prevent
 * inappropriate queries while allowing for typos and variations.
 */
/**
 * Validates and sanitizes user input for food searches
 *
 * Performs comprehensive validation including:
 * - Type checking and null/empty validation
 * - Input sanitization (trimming, case normalization)
 * - Suspicious pattern detection to filter non-food queries
 *
 * @param input - Raw user input to validate
 * @returns Validation result with sanitized input or error message
 */
export function validateAndSanitizeInput(input) {
    // Check for basic input validity
    if (!input || typeof input !== "string" || input.trim().length === 0) {
        return {
            isValid: false,
            error: "Please provide a valid food name to search for.",
        };
    }
    // Sanitize input: trim whitespace and normalize case
    const sanitized = input.trim().toLowerCase();
    /**
     * Suspicious pattern detection
     *
     * These regex patterns identify clearly non-food queries that should be rejected.
     * We use context-aware patterns (e.g., "unicorn food" not just "unicorn") to
     * avoid blocking legitimate foods with whimsical names like "dragon fruit".
     */
    const suspiciousPatterns = [
        // Mythical creature + body parts (clearly not food)
        /unicorn\s+(food|meat|flesh)/i,
        /gargoyle\s+(claws|wings|scales)/i,
        /dragon\s+(claws|wings|scales|blood)/i,
        /fairy\s+(dust|wings|magic)/i,
        // Body fluids and waste (not food)
        /earwax/i,
        /hooves/i,
        /poop/i,
        /poo/i,
        /pee/i,
        /urine/i,
        // Non-food materials in isolation
        /blood\s+(alone|drink)/i,
        /flesh\s+(alone|raw)/i,
        /rock\s+(alone|hard)/i,
        /stone\s+(alone|hard)/i,
        /metal\s+(alone|hard)/i,
        /plastic\s+(alone|hard)/i,
        /glass\s+(alone|hard)/i,
        /wood\s+(alone|hard)/i,
    ];
    // Check if input matches any suspicious patterns
    const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(sanitized));
    if (isSuspicious) {
        return {
            isValid: false,
            error: `Sorry, "${input}" doesn't appear to be a real food. Please try asking about actual foods like "banana", "apple", "chicken", "rice", etc.`,
        };
    }
    // Input is valid and sanitized
    return { isValid: true, sanitized };
}
/**
 * Calculates confidence score for food name matching
 *
 * Implements a sophisticated matching algorithm that considers:
 * - Exact matches (highest score)
 * - Word-by-word matches
 * - Fuzzy matching for typos (Levenshtein distance)
 * - Food category indicators
 *
 * @param searchTerm - User's search query
 * @param foodName - Food name from database to match against
 * @returns Confidence score (0-100) indicating match quality
 */
export function calculateMatchConfidence(searchTerm, foodName) {
    // Split search term into meaningful words (filter out short words)
    const searchWords = searchTerm.split(" ").filter((word) => word.length > 2);
    let confidence = 0;
    // Exact match gets highest score (50 points)
    if (foodName.includes(searchTerm)) {
        confidence += 50;
    }
    // Word-by-word matching with fuzzy tolerance
    searchWords.forEach((word) => {
        if (foodName.includes(word)) {
            // Exact word match (20 points per word)
            confidence += 20;
        }
        else {
            // Fuzzy matching for typos (allows 1-2 character differences)
            const fuzzyMatch = foodName.split(" ").some((foodWord) => {
                // Skip if length difference is too large
                if (Math.abs(word.length - foodWord.length) > 2)
                    return false;
                // Simple Levenshtein-like distance calculation
                let differences = 0;
                const minLength = Math.min(word.length, foodWord.length);
                // Count character-by-character differences
                for (let i = 0; i < minLength; i++) {
                    if (word[i] !== foodWord[i])
                        differences++;
                }
                // Add length difference
                differences += Math.abs(word.length - foodWord.length);
                // Allow up to 2 character differences for fuzzy match
                return differences <= 2;
            });
            if (fuzzyMatch) {
                // Fuzzy match (10 points per word)
                confidence += 10;
            }
        }
    });
    // Bonus points for common food category indicators
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
        confidence += 5; // Food category bonus
    }
    return confidence;
}
