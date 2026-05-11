import { getChatResponse } from './src/lib/gemini';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  console.log(`\n🚀 Testing with model: ${model}`);
  
  try {
    const res = await getChatResponse(
      "You are a helpful AI assistant. Answer in Thai.",
      [],
      "สวัสดี คุณคือใครและใช้โมเดลอะไรอยู่?"
    );
    console.log("✅ AI Response:");
    console.log("-----------------------------------");
    console.log(res);
    console.log("-----------------------------------");
  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
}

test();
