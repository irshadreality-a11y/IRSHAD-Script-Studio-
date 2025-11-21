import { GoogleGenAI } from "@google/genai";
import { GenerationOptions } from "../types";

const MODEL_NAME = "gemini-3-pro-preview";

export const generateScriptFromVideo = async (
  videoFile: File,
  options: GenerationOptions
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Convert file to Base64
  const base64Data = await fileToGenerativePart(videoFile);

  // 2. Construct Prompt based on user rules
  const systemPrompt = `
You are IRSHAD Script Studio, the world's best viral video scriptwriter.
Your goal is to analyze the provided video and write a high-retention, hyper-engaging narration script.

**YOUR ONLY PURPOSE:**
1. Analyze every scene frame-by-frame.
2. Understand actions, objects, characters, and context.
3. Write a gripping narration script.

**STYLE RULES (STRICTLY FOLLOW):**
- Open with a HARD HOOK (curiosity, shock, or twist) in the first 1-2 lines.
- Narrate visually. Describe what is happening but in a dramatic story format.
- Short, punchy, emotional sentences.
- Build curiosity constantly (e.g., "But what happens next...", "The secret is...").
- Tone: ${options.tone}.
- Target Audience: ${options.platform} viewers.
- NO fake events. Only describe what is visually in the video.
- NO moralizing, warnings, or filler words.
- NO technical analysis text.

**OUTPUT FORMAT:**
You must output the response exactly in this format:

⬛ [Write a Short Catchy Title Here]

⬛ Viral Narration Script
[Line 1 of script]
[Line 2 of script]
...
[Final satisfying line]

**LENGTH CONSTRAINT:**
${options.length}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: videoFile.type,
              data: base64Data,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      },
    });

    return response.text || "Failed to generate script. Please try again.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An error occurred while generating the script.");
  }
};

// Helper to convert File to Base64 string (without the data prefix for API)
const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the "data:video/mp4;base64," part
      const base64Content = base64String.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
