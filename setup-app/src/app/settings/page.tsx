"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { DashboardLayout } from "@/components/DashboardLayout";

type Provider = "gemini" | "claude" | "openai" | "zlm";

interface ConfigState {
  geminiKey: string;
  claudeKey: string;
  openaiKey: string;
  zlmKey: string;
  activeProvider: Provider;
  hasGemini: boolean;
  hasClaude: boolean;
  hasOpenai: boolean;
  hasZlm: boolean;
}

const PROVIDERS: { id: Provider; name: string; icon: string; color: string; desc: string; placeholder: string }[] = [
  { id: "zlm", name: "ZLM AI", icon: "⚡", color: "#E86A17", desc: "GLM-4 Flash — fast & reliable", placeholder: "55b5e735..." },
  { id: "gemini", name: "Google Gemini", icon: "✨", color: "#4285F4", desc: "Gemini 2.0 Flash — fast & capable", placeholder: "AIzaSy..." },
  { id: "claude", name: "Anthropic Claude", icon: "🤖", color: "#D97706", desc: "Claude 3.5 Sonnet — best reasoning", placeholder: "sk-ant-..." },
  { id: "openai", name: "OpenAI GPT", icon: "🧠", color: "#10A37F", desc: "GPT-4o Mini — balanced quality", placeholder: "sk-..." },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingKey, setEditingKey] = useState<Provider | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [activeProvider, setActiveProvider] = useState<Provider>("gemini");

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setConfig(data);
      setActiveProvider(data.activeProvider);
    } catch { setMessage("❌ Config yüklenemedi"); }
    setLoading(false);
  };

  const saveKey = async (provider: Provider) => {
    if (!keyInput.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (provider === "gemini") body.geminiKey = keyInput;
      if (provider === "claude") body.claudeKey = keyInput;
      if (provider === "openai") body.openaiKey = keyInput;
      if (provider === "zlm") body.zlmKey = keyInput;
      body.activeProvider = provider;

      await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setMessage(`✅ ${provider} API key saved!`);
      setEditingKey(null);
      setKeyInput("");
      await loadConfig();
    } catch { setMessage("❌ Kaydetme hatası"); }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const removeKey = async (provider: Provider) => {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (provider === "gemini") body.geminiKey = "";
      if (provider === "claude") body.claudeKey = "";
      if (provider === "openai") body.openaiKey = "";
      if (provider === "zlm") body.zlmKey = "";

      await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setMessage(`🗑 ${provider} key removed`);
      await loadConfig();
    } catch { setMessage("❌ Silme hatası"); }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const setActive = async (provider: Provider) => {
    setActiveProvider(provider);
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeProvider: provider }) });
    setMessage(`⚡ Active provider: ${provider}`);
    await loadConfig();
    setTimeout(() => setMessage(""), 2000);
  };

  const isConnected = (p: Provider) => {
    if (!config) return false;
    if (p === "gemini") return config.hasGemini;
    if (p === "claude") return config.hasClaude;
    if (p === "openai") return config.hasOpenai;
    if (p === "zlm") return config.hasZlm;
    return false;
  };

  const getMaskedKey = (p: Provider) => {
    if (!config) return "";
    if (p === "gemini") return config.geminiKey;
    if (p === "claude") return config.claudeKey;
    if (p === "openai") return config.openaiKey;
    if (p === "zlm") return config.zlmKey;
    return "";
  };

  if (loading) return <div className={`container ${styles.page}`}><p>Loading...</p></div>;

  return (
    <DashboardLayout>
      <div className={`container ${styles.page}`}>
        <section className={styles.header}>
          <p className={styles.label}>⚙ Settings</p>
          <h1>AI <span>Providers</span></h1>
          <p className={styles.desc}>Connect your AI API keys. Your keys are stored locally on this server — never sent anywhere except to the AI provider.</p>
        </section>

        {message && <div className={styles.toast}>{message}</div>}

        <div className={styles.providers}>
          {PROVIDERS.map(p => (
            <div key={p.id} className={`${styles.providerCard} ${activeProvider === p.id ? styles.providerActive : ""}`}>
              <div className={styles.providerHeader}>
                <div className={styles.providerInfo}>
                  <span className={styles.providerIcon} style={{ color: p.color }}>{p.icon}</span>
                  <div>
                    <h3>{p.name}</h3>
                    <p className={styles.providerDesc}>{p.desc}</p>
                  </div>
                </div>
                <div className={styles.providerStatus}>
                  {isConnected(p.id) ? (
                    <span className={styles.connected}>● Connected</span>
                  ) : (
                    <span className={styles.disconnected}>○ Not connected</span>
                  )}
                </div>
              </div>

              {/* Key management */}
              <div className={styles.keySection}>
                {isConnected(p.id) && editingKey !== p.id ? (
                  <div className={styles.keyRow}>
                    <code className={styles.maskedKey}>{getMaskedKey(p.id)}</code>
                    <div className={styles.keyActions}>
                      <button className={styles.useBtn} onClick={() => setActive(p.id)} disabled={activeProvider === p.id}>
                        {activeProvider === p.id ? "✓ Active" : "Use This"}
                      </button>
                      <button className={styles.editBtn} onClick={() => { setEditingKey(p.id); setKeyInput(""); }}>Edit</button>
                      <button className={styles.removeBtn} onClick={() => removeKey(p.id)}>Remove</button>
                    </div>
                  </div>
                ) : editingKey === p.id ? (
                  <div className={styles.keyForm}>
                    <input
                      type="password"
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                      placeholder={p.placeholder}
                      autoFocus
                    />
                    <div className={styles.keyFormBtns}>
                      <button onClick={() => saveKey(p.id)} disabled={saving || !keyInput.trim()}>
                        {saving ? "Saving..." : "Save Key"}
                      </button>
                      <button className={styles.cancelBtn} onClick={() => { setEditingKey(null); setKeyInput(""); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className={styles.connectBtn} onClick={() => setEditingKey(p.id)} style={{ borderColor: p.color, color: p.color }}>
                    + Connect {p.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <section className={styles.infoBox}>
          <h3>🔒 Security</h3>
          <p>API keys are stored in a local <code>.ai-config.json</code> file on this server. They are never exposed to the browser — only the last 4 characters are shown. All AI requests are proxied through the server.</p>
        </section>
      </div>
    </DashboardLayout>
  );
}
