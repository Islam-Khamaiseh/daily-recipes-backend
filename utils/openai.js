const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateRecipeJSON({
  ingredients,
  cookingTime,
  equipments,
  dietarys,
  nutritionalFocus,
  region,
  additionalIngredients2,
}) {
  const prompt = `
You are a recipe generator. Create a single recipe based on the following criteria:

- Main Ingredients: ${ingredients.join(", ")}
- Cooking Time: ${cookingTime ? cookingTime : "None"}
- The recipe should use **only** this Equipment: ${
    equipments.length > 0 ? equipments.join(", ") : "None"
  }
- Dietary Preferences: ${dietarys.length > 0 ? dietarys.join(", ") : "None"}
- Nutritional Focus: ${
    nutritionalFocus.length > 0 ? nutritionalFocus.join(", ") : "None"
  }
- Cuisine/Region: ${region ? region : "None"}
- ${additionalIngredients2}

    

Generate the recipe in two languages: English and Arabic:

Required Output:
- Provide valid JSON only, with the following structure (no extra text or keys, no code fences):

{
  "english": {
    "title": "...",
    "servings": "...",
    "ingredients": [
      "...",
      "..."
    ],
    "instructions": [
      "...",
      "..."
    ],
    "nutritionalSummary": [
      "...",
      "..."
    ]
  },
  "arabic": {
    "title": "...",
    "servings": "...",
    "ingredients": [
      "...",
      "..."
    ],
    "instructions": [
      "...",
      "..."
    ],
    "nutritionalSummary": [
      "...",
      "..."
    ]
  }
}

Rules:
1. The JSON must have exactly the fields above, and must fill each field.
2. No additional text or headings outside the JSON. No concluding remarks.
3. "title" and "servings" are strings; "ingredients" and "instructions" are arrays of strings.
4. "nutritionalSummary" must be an array of strings, each describing approximate nutrition PER SERVING.
5. You must provide at least FOUR items in each nutritionalSummary (you can show more than FOUR if needed), such as:
   - "Calories (per serving): 300"
   - "Protein (per serving): 15g"
   - "Carbs (per serving): 40g"
   - "Fat (per serving): 10g"
   (Adjust the approximate values as needed, but do not omit any.)
6. End your output immediately after the final closing brace.
 

`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const rawText = response.choices[0].message.content.trim();
    const recipeObj = JSON.parse(rawText); // => { english: {...}, arabic: {...} }
    return recipeObj;
  } catch (error) {
    console.error("OpenAI generation error:", error);
    throw error;
  }
}

module.exports = { generateRecipeJSON };
