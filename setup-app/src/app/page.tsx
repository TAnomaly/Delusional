"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import VideoBackground from "@/components/VideoBackground";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  task?: string | null;
  note?: string | null;
  provider?: string;
  timestamp: Date;
  error?: boolean;
}

interface ProviderInfo {
  activeProvider: string;
  hasGemini: boolean;
  hasClaude: boolean;
  hasOpenai: boolean;
}

const PROVIDER_LABELS: Record<string, { icon: string; name: string }> = {
  zlm: { icon: "⚡", name: "ZLM AI" },
  gemini: { icon: "✨", name: "Gemini" },
  claude: { icon: "🤖", name: "Claude" },
  openai: { icon: "🧠", name: "GPT" },
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      setProviderInfo(data);
      const hasKey = data.hasGemini || data.hasClaude || data.hasOpenai;
      const providerName = PROVIDER_LABELS[data.activeProvider]?.name || data.activeProvider;

      setMessages([{
        id: 0, role: "ai",
        text: hasKey
          ? `Welcome. I am connected via **${providerName}**. Ready to process research, analyze data, and generate actionable tasks for your board.`
          : `System is offline. No AI provider is connected. Please navigate to the **Settings** panel to configure your API keys.`,
        timestamp: new Date(),
        provider: hasKey ? data.activeProvider : undefined,
      }]);
    });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), role: "user", text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = [...messages.filter(m => m.id !== 0), userMsg]
        .slice(-10)
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: "ai", text: `⚠️ ${data.error}`,
          timestamp: new Date(), error: true,
        }]);
      } else {
        const aiMsg: Message = {
          id: Date.now() + 1, role: "ai", text: data.reply,
          task: data.task, note: data.note, provider: data.provider,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "ai", text: "⚠️ System offline. Connection refused.",
        timestamp: new Date(), error: true,
      }]);
    }

    setIsTyping(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const renderMd = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) return <strong key={i} className={styles.bold}>{line.slice(2, -2)}</strong>;
      if (line.startsWith("**") && line.includes(":**")) {
        const [k, ...v] = line.split(":**");
        return <p key={i}><strong>{k.replace(/\*\*/g, "")}:</strong>{v.join(":**")}</p>;
      }
      if (line.startsWith("- ")) return <div key={i} className={styles.li}><span className={styles.bullet}>›</span>{line.slice(2)}</div>;
      if (line.startsWith("> ")) return <blockquote key={i} className={styles.quote}>{line.slice(2)}</blockquote>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i}>{line}</p>;
    });

  const activeLabel = providerInfo ? PROVIDER_LABELS[providerInfo.activeProvider] : null;
  const isHeroMode = messages.length <= 1;

  // Render hero landing if chat hasn't started
  if (isHeroMode) {
    return (
      <>
        <VideoBackground />
        <div className={styles.page}>
          <div className={styles.heroContainer}>
          <h1 className={`${styles.heroHeading} instrument`}>Built for the curious</h1>
          
          <div className={`${styles.inputWrapper} ${styles.hero}`}>
            <div className={`${styles.inputBar} liquid-glass`}>
              <input 
                ref={inputRef as any}
                type="text"
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything..."
                disabled={isTyping}
              />
              <button className={styles.sendBtn} onClick={send} disabled={!input.trim() || isTyping}>
                <ArrowRightIcon />
              </button>
            </div>
            
            <p className={styles.heroSubtitle}>
              {messages[0]?.text || "Initializing system..."}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <a href="#" className={`${styles.socialBtn} liquid-glass`} aria-label="Instagram"><InstagramIcon /></a>
          <a href="#" className={`${styles.socialBtn} liquid-glass`} aria-label="Twitter"><TwitterIcon /></a>
          <a href="#" className={`${styles.socialBtn} liquid-glass`} aria-label="Website"><GlobeIcon /></a>
        </div>
      </div>
    </>
  );
}

  // Render actual chat once interaction begins
  return (
    <>
      <VideoBackground />
      <div className={styles.page}>
        <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.msg} ${msg.role === "user" ? styles.msgUser : styles.msgAi} ${msg.error ? styles.msgError : ""}`}>
              <div className={`${styles.msgBubble} ${msg.role === "ai" ? "liquid-glass" : ""}`}>
                {msg.role === "ai" && (
                  <span className={styles.aiTag}>
                    ◆ delusional {msg.provider ? `· ${PROVIDER_LABELS[msg.provider]?.name}` : ""}
                  </span>
                )}
                <div className={styles.msgText}>{renderMd(msg.text)}</div>
                {(msg.task || msg.note) && (
                  <div className={styles.actionTags}>
                    {msg.task && <span className={styles.tagTask}>📌 Task Added: {msg.task}</span>}
                    {msg.note && <span className={styles.tagNote}>📝 Note Saved: {msg.note}</span>}
                  </div>
                )}
              </div>
              <span className={styles.msgTime}>{msg.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <div className={`${styles.msgBubble} liquid-glass`}>
                <span className={styles.aiTag}>◆ delusional {activeLabel ? `· ${activeLabel.name}` : ""}</span>
                <div className={styles.typing}><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputWrapper}>
          <div className={`${styles.inputBar} liquid-glass`}>
            <textarea 
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question, create a task..."
              rows={1}
              disabled={isTyping}
            />
            <button className={styles.sendBtn} onClick={send} disabled={!input.trim() || isTyping}>
              <ArrowRightIcon />
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
