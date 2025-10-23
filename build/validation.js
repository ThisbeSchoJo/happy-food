// Input validation and sanitization utilities
export function validateAndSanitizeInput(input) {
    if (!input || typeof input !== "string" || input.trim().length === 0) {
        return {
            isValid: false,
            error: "Please provide a valid food name to search for.",
        };
    }
    const sanitized = input.trim().toLowerCase();
    // Check for suspicious patterns
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
    const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(sanitized));
    if (isSuspicious) {
        return {
            isValid: false,
            error: `Sorry, "${input}" doesn't appear to be a real food. Please try asking about actual foods like "banana", "apple", "chicken", "rice", etc.`,
        };
    }
    return { isValid: true, sanitized };
}
export function calculateMatchConfidence(searchTerm, foodName) {
    const searchWords = searchTerm.split(" ").filter((word) => word.length > 2);
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
            const fuzzyMatch = foodName.split(" ").some((foodWord) => {
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
    return confidence;
}
