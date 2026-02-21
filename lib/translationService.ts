import OpenAI from "openai";

const SYSTEM_PROMPT =
  "Eres un traductor experto en turismo de lujo. Traduce el siguiente texto del español al inglés manteniendo el tono evocador, elegante y persuasivo.";

export async function translateText(
  text: string,
  targetLang: "en"
): Promise<string | null> {
  if (!text?.trim()) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[translateText] OPENAI_API_KEY no configurada.");
    return null;
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text.trim() },
      ],
      temperature: 0.3,
    });

    const translated = choices[0]?.message?.content?.trim();
    return translated ?? null;
  } catch (err) {
    console.error("[translateText]", err);
    return null;
  }
}
