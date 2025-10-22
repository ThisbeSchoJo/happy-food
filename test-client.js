#!/usr/bin/env node

// Simple test client for Happy Food MCP Server
import { spawn } from "child_process";

const server = spawn("node", ["build/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

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

// Test function
function testFood(food) {
  console.log(`\n🔍 Testing: ${food}`);
  const request = {
    jsonrpc: "2.0",
    id: Math.floor(Math.random() * 1000),
    method: "tools/call",
    params: {
      name: "get-food-mood-effects",
      arguments: { food: food },
    },
  };

  server.stdin.write(JSON.stringify(request) + "\n");
}

// Test different foods
console.log("🚀 Starting Happy Food MCP Server Test Client");
console.log("Testing various foods...\n");

// Test foods
testFood("banana");
setTimeout(() => testFood("apple"), 1000);
setTimeout(() => testFood("matcha latte with oat milk"), 2000);
setTimeout(() => testFood("dark chocolate"), 3000);
setTimeout(() => testFood("nonexistent food"), 4000);

// Clean up after tests
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 5000);
