import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export type AIProvider = "gemini" | "claude" | "openai" | "zlm";

export interface AIConfig {
  geminiKey: string;
  claudeKey: string;
  openaiKey: string;
  zlmKey: string;
  activeProvider: AIProvider;
}

const CONFIG_PATH = join(process.cwd(), ".ai-config.json");

const DEFAULT_CONFIG: AIConfig = {
  geminiKey: "",
  claudeKey: "",
  openaiKey: "",
  zlmKey: "",
  activeProvider: "gemini",
};

export function getConfig(): AIConfig {
  if (!existsSync(CONFIG_PATH)) return DEFAULT_CONFIG;
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: AIConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getActiveKey(config: AIConfig): string {
  switch (config.activeProvider) {
    case "gemini": return config.geminiKey;
    case "claude": return config.claudeKey;
    case "openai": return config.openaiKey;
    case "zlm": return config.zlmKey;
  }
}

export function hasAnyKey(config: AIConfig): boolean {
  return !!(config.geminiKey || config.claudeKey || config.openaiKey || config.zlmKey);
}
