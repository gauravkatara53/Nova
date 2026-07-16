import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string,
  model: string = "llama-3.1-8b-instant"
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  model: string = "llama-3.1-8b-instant"
): Promise<T> {
  const response = await generateAIResponse(
    systemPrompt + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.",
    userPrompt,
    model
  );

  try {
    // Strip potential markdown code blocks
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    console.error("Failed to parse AI response as JSON:", response);
    throw new Error("Failed to parse AI response");
  }
}

export async function streamAIResponse(
  systemPrompt: string,
  userPrompt: string,
  model: string = "llama-3.1-8b-instant"
) {
  const stream = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  return stream;
}

export { openai };
