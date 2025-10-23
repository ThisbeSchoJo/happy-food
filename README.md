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

- `search-food-matches`: Search for food matches with confidence scoring
- `get-food-mood-effects`: Analyze mood effects of confirmed foods
- `health-check`: Check server and API health status

## Production Deployment

### Environment Variables

```bash
export USDA_API_KEY=your_api_key_here
```

### Health Monitoring

Use the `health-check` tool to monitor:

- USDA API connectivity
- Local database status
- Server health

### Available Scripts

```bash
npm run build    # Build the TypeScript
npm run start    # Start the server
npm run dev      # Build and start
npm run test     # Run test client
```

## Example Foods

Try these foods for testing:

- "banana" (USDA database)
- "matcha latte with oat milk" (local database)
- "dark chocolate" (local database)
