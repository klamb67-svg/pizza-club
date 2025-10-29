import { genAI } from "./geminiClient";

async function testJules() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Say hello from Jules, the Pizza Club AI assistant!";
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

testJules();
