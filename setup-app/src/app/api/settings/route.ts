import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig, type AIConfig } from "@/lib/ai-config";

// GET — return current config (keys masked)
export async function GET() {
  const config = getConfig();
  return NextResponse.json({
    geminiKey: config.geminiKey ? "••••" + config.geminiKey.slice(-4) : "",
    claudeKey: config.claudeKey ? "••••" + config.claudeKey.slice(-4) : "",
    openaiKey: config.openaiKey ? "••••" + config.openaiKey.slice(-4) : "",
    zlmKey: config.zlmKey ? "••••" + config.zlmKey.slice(-4) : "",
    activeProvider: config.activeProvider,
    hasGemini: !!config.geminiKey,
    hasClaude: !!config.claudeKey,
    hasOpenai: !!config.openaiKey,
    hasZlm: !!config.zlmKey,
  });
}

// POST — save config
export async function POST(req: NextRequest) {
  const body = await req.json();
  const current = getConfig();

  const updated: AIConfig = {
    geminiKey: body.geminiKey !== undefined ? body.geminiKey : current.geminiKey,
    claudeKey: body.claudeKey !== undefined ? body.claudeKey : current.claudeKey,
    openaiKey: body.openaiKey !== undefined ? body.openaiKey : current.openaiKey,
    zlmKey: body.zlmKey !== undefined ? body.zlmKey : current.zlmKey,
    activeProvider: body.activeProvider || current.activeProvider,
  };

  saveConfig(updated);

  return NextResponse.json({ success: true, activeProvider: updated.activeProvider });
}
