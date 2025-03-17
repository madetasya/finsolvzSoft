import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function geminiPrompt(rawJson) {
  try {
    console.log("Sending Prompt:", rawJson);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Take this raw data and clean it into structured JSON:
      ${JSON.stringify(rawJson)}
"Convert the following data into a JSON array of objects, following this structure:

[
  {
    "title": "Category Title",
    "value": "Category Value",
    "isTotal": true/false,
    "subCategory": [
      {
        "title": "Subcategory Title",
        "value": "Subcategory Value",
        "isTotal": true/false
      },
      // ... more subcategories
    ]
  },
  // ... more categories
]
Use the provided data to populate the title, value, isTotal, and subCategory fields appropriately.  
Set isTotal to true for categories and subcategories that represent totals, and false for individual items.  
Nest subcategories within their parent categories.

      **Return ONLY pure JSON output, without any extra text, markdown, or formatting.**
    `;

    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    let responseText = result.response.text();

    responseText = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("DUMDUMDUMDUMDUM=======================>>>GEMINIDUMDUMDUM", error);
    throw new Error("Error processing JSON with AI");
  }
}

export default { geminiPrompt };
