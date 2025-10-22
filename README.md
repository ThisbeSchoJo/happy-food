# Happy Food MCP Server

A Model Context Protocol (MCP) server that analyzes the mood effects of foods based on their nutritional content and neurotransmitter impact.

## Setup

1. **Get USDA API Key:**

   - Go to https://api.data.gov/signup/
   - Sign up for a free account
   - Copy your API key

2. **Set Environment Variable:**

   ```bash
   export USDA_API_KEY=your_api_key_here
   ```

3. **Build and Run:**
   ```bash
   npm run build
   node build/index.js
   ```

## Features

- **Real USDA Data**: Uses the official USDA FoodData Central database
- **Local Fallback**: Includes curated mood analysis for common foods
- **Mood Analysis**: Analyzes how nutrients affect neurotransmitters and mood

## Usage

The server provides these tools:

- `get-food-mood-effects`: Analyze mood effects of any food
- `get-food-nutrition`: Get detailed nutritional information

## Example Foods

Try these foods for testing:

- "banana" (USDA database)
- "matcha latte with oat milk" (local database)
- "dark chocolate" (local database)
