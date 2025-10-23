/**
 * Happy Food MCP Server - Main Entry Point
 *
 * This is the main entry point for the Happy Food MCP server that analyzes
 * the mood effects of foods based on their nutritional content and neurotransmitter impact.
 *
 * The server provides tools for:
 * - Searching food matches with confidence scoring
 * - Analyzing mood effects of specific foods
 * - Health monitoring and status checks
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerFoodTools } from "./tools.js";
/**
 * Create the MCP server instance with basic configuration
 * This server will handle food mood analysis requests from Claude Desktop
 */
const server = new McpServer({
    name: "happy-food",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Register all food-related tools (search, analysis, health check)
registerFoodTools(server);
/**
 * Main server startup function
 * Sets up stdio transport for communication with Claude Desktop
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Happy Food MCP Server running on stdio");
}
// Start the server with proper error handling
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
