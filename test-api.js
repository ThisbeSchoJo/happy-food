// Quick test script to see what USDA API returns
async function testUSDAAPI() {
  const food = "matcha latte with oat milk";
  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
    food
  )}&pageSize=3`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("USDA API Response for:", food);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testUSDAAPI();
