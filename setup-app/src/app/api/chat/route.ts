import { NextRequest, NextResponse } from "next/server";
import { getConfig, getActiveKey } from "@/lib/ai-config";

const SYSTEM_PROMPT = `Sen "Delusional" isimli bir AI-powered dijital beyin uygulamasının asistanısın. Kullanıcıya görev yönetimi, araştırma ve not alma konularında yardım ediyorsun.

KURALLAR:
- Türkçe yanıt ver (kullanıcı İngilizce yazarsa İngilizce yanıt ver)
- Kısa ve öz ol, gereksiz uzatma
- Kullanıcı bir görev istediğinde, "[TASK: görev açıklaması]" formatında etiketle
- Kullanıcı araştırma istediğinde detaylı bilgi ver ve sonunda "[NOTE: başlık]" formatında etiketle
- Kullanıcı not kaydetmek istediğinde "[NOTE: başlık]" etiketle
- Her yanıtta en fazla bir TASK ve bir NOTE etiketi kullan
- Markdown formatı kullan (bold, liste, vb.)`;

// ── Gemini API ──
async function callGemini(apiKey: string, messages: { role: string; content: string }[]) {
  const contents = messages.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  // Prepend system instruction as first user+model exchange
  contents.unshift(
    { role: "user", parts: [{ text: "System: " + SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Anladım, bu kurallara göre yanıt vereceğim." }] },
  );

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 429) {
      throw new Error("Gemini kota limiti doldu. Birkaç dakika bekle ya da Settings'den başka bir provider seç.");
    }
    throw new Error(`Gemini API hatası (${res.status}). API key'ini kontrol et.`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı.";
}

// ── Claude API ──
async function callClaude(apiKey: string, messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Claude kota limiti doldu. Biraz bekle.");
    if (res.status === 401) throw new Error("Claude API key geçersiz. Settings'den kontrol et.");
    throw new Error(`Claude API hatası (${res.status}). Key'ini kontrol et.`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "Yanıt alınamadı.";
}

// ── OpenAI API ──
async function callOpenAI(apiKey: string, messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("OpenAI kota limiti doldu. Biraz bekle.");
    if (res.status === 401) throw new Error("OpenAI API key geçersiz. Settings'den kontrol et.");
    throw new Error(`OpenAI API hatası (${res.status}). Key'ini kontrol et.`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Yanıt alınamadı.";
}

// ── ZLM AI (OpenAI-compatible) ──
async function callZlm(apiKey: string, messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("ZLM AI kota limiti doldu. Biraz bekle.");
    if (res.status === 401) throw new Error("ZLM AI key geçersiz. Settings'den kontrol et.");
    throw new Error(`ZLM AI hatası (${res.status}). Key'ini kontrol et.`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Yanıt alınamadı.";
}

// ── Route ──
export async function POST(req: NextRequest) {
  try {
    const { messages, provider: overrideProvider } = await req.json();
    const config = getConfig();
    const provider = overrideProvider || config.activeProvider;
    const key = provider === "gemini" ? config.geminiKey
              : provider === "claude" ? config.claudeKey
              : provider === "zlm" ? config.zlmKey
              : config.openaiKey;

    if (!key) {
      return NextResponse.json(
        { error: `No API key configured for ${provider}. Go to Settings to add your key.` },
        { status: 400 }
      );
    }

    let reply: string;

    switch (provider) {
      case "gemini":
        reply = await callGemini(key, messages);
        break;
      case "claude":
        reply = await callClaude(key, messages);
        break;
      case "openai":
        reply = await callOpenAI(key, messages);
        break;
      case "zlm":
        reply = await callZlm(key, messages);
        break;
      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    // Extract [TASK: ...] and [NOTE: ...] tags from AI response
    const taskMatch = reply.match(/\[TASK:\s*(.+?)\]/);
    const noteMatch = reply.match(/\[NOTE:\s*(.+?)\]/);

    // Clean tags from displayed text
    let cleanReply = reply
      .replace(/\[TASK:\s*.+?\]/g, "")
      .replace(/\[NOTE:\s*.+?\]/g, "")
      .trim();

    return NextResponse.json({
      reply: cleanReply,
      provider,
      task: taskMatch ? taskMatch[1] : null,
      note: noteMatch ? noteMatch[1] : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
