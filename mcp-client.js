#!/usr/bin/env node

// Simple MCP client for testing Happy Food server
import { spawn } from "child_process";

const server = spawn("node", ["build/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    USDA_API_KEY: "DaE4Ljcov428VPj5A9930A2eZ0u4cFkMv9UdUt05",
  },
});

let requestId = 1;

// Handle server output
server.stdout.on("data", (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log("\n📋 Server Response:");
    console.log(JSON.stringify(response, null, 2));

    if (response.result && response.result.content) {
      console.log("\n🍽️ Food Analysis:");
      response.result.content.forEach((content) => {
        if (content.type === "text") {
          console.log(content.text);
        }
      });
    }
  } catch (error) {
    console.log("Server output:", data.toString());
  }
});

server.stderr.on("data", (data) => {
  console.log("Server error:", data.toString());
});

// Interactive function
function askAboutFood(food) {
  console.log(`\n🔍 Analyzing: ${food}`);
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method: "tools/call",
    params: {
      name: "get-food-mood-effects",
      arguments: { food: food },
    },
  };

  server.stdin.write(JSON.stringify(request) + "\n");
}

// Interactive mode
console.log("🚀 Happy Food MCP Server - Interactive Mode");
console.log("Type foods to analyze, or 'quit' to exit\n");

// Handle user input
process.stdin.on("data", (data) => {
  const input = data.toString().trim();

  if (input.toLowerCase() === "quit") {
    server.kill();
    process.exit(0);
  }

  if (input) {
    askAboutFood(input);
  }
});

// Show available tools
setTimeout(() => {
  console.log("\n📋 Available tools:");
  console.log("- get-food-mood-effects: Analyze mood effects of any food");
  console.log("- get-food-nutrition: Get detailed nutritional information");
  console.log(
    "\nTry: 'banana', 'apple', 'dark chocolate', 'matcha latte with oat milk'"
  );
  console.log("Or type 'quit' to exit\n");
}, 1000);
