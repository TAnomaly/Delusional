"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Source = "all" | "ai-chat" | "research" | "manual";

interface Note {
  id: number;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  linkedTask?: string;
}

const SRC: Record<string, { label: string; color: string; icon: string }> = {
  "ai-chat": { label: "AI Chat", color: "#E86A17", icon: "🤖" },
  "research": { label: "Research", color: "#4285F4", icon: "🔍" },
  "manual": { label: "Manual", color: "#7C3AED", icon: "✏️" },
};

const NOTES: Note[] = [
  {
    id: 1, title: "Monitör araştırması — Dell vs LG",
    content: "**27\" 4K IPS Panel karşılaştırması:**\n\n- Dell U2723QE — USB-C hub, 90W PD, KVM switch\n- LG 27UK850 — HDR10, USB-C destekli\n- ASUS ProArt PA279CV — Renk doğruluğu üstün\n\n**Sonuç:** Masa derinliği 60cm altındaysa 27\" seçilmeli. Dell en iyi USB-C deneyimi sunuyor.",
    source: "research", timestamp: "2026-03-29T10:30:00Z", linkedTask: "Monitör karşılaştırması"
  },
  {
    id: 2, title: "Kablo yönetimi fikirleri",
    content: "AI ile konuşma özeti:\n\n- IKEA SIGNUM — masanın altına vidalanan kablo kanalı\n- Velcro bant — tekrar kullanılabilir cable ties\n- Under-desk tray — mount edilen tepsi sistemi\n\n> \"Minimal masanın sırrı, kablonun görünmemesidir\"",
    source: "ai-chat", timestamp: "2026-03-29T09:15:00Z", linkedTask: "Kablo düzenleme sistemi"
  },
  {
    id: 3, title: "Mekanik klavye notları",
    content: "**Switch Tipleri:**\n- Cherry MX Brown — Tactile, sessiz\n- Gateron Yellow — Smooth linear\n- Boba U4T — Thocky tactile\n\n**Modeller:**\n- Keychron Q1 Pro — Wireless, hot-swap\n- HHKB Hybrid — Topre, minimalist",
    source: "research", timestamp: "2026-03-28T14:00:00Z"
  },
  {
    id: 4, title: "Ergonomi kuralları",
    content: "- Monitör üst kenarı göz hizasında\n- Kol dayama 90°\n- Her 20dk bir 20-20-20 kuralı\n- Masa yüksekliği: 72-75cm",
    source: "manual", timestamp: "2026-03-27T11:00:00Z"
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(NOTES);
  const [filter, setFilter] = useState<Source>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState<Source>("manual");

  const filtered = notes
    .filter(n => filter === "all" || n.source === filter)
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  const create = () => {
    if (!title.trim()) return;
    setNotes([{ id: Date.now(), title, content, source, timestamp: new Date().toISOString() }, ...notes]);
    setTitle(""); setContent(""); setSource("manual"); setShowCreate(false);
  };

  const del = (id: number) => setNotes(prev => prev.filter(n => n.id !== id));
  const copy = (n: Note) => navigator.clipboard.writeText(`# ${n.title}\n\n${n.content}`);
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const renderMd = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.includes(":**")) {
        const [k, ...v] = line.split(":**");
        return <p key={i}><strong className={styles.mdBold}>{k.replace(/\*\*/g, "")}:</strong>{v.join(":**")}</p>;
      }
      if (line.startsWith("> ")) return <blockquote key={i} className={styles.mdQuote}>{line.slice(2)}</blockquote>;
      if (line.startsWith("- ")) return <div key={i} className={styles.mdLi}><span className={styles.mdBullet}>›</span>{line.slice(2)}</div>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i}>{line}</p>;
    });

  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.header}>
        <div>
          <p className={styles.label}>◈ Notes</p>
          <h1>Saved <span>Knowledge</span></h1>
          <p className={styles.desc}>AI sohbetlerinden, araştırmalardan ve manuel notlardan oluşan bilgi bankası.</p>
        </div>
        <button onClick={() => setShowCreate(true)}>+ New Note</button>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(["all", "ai-chat", "research", "manual"] as Source[]).map(s => (
            <button key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.active : ""}`}
              onClick={() => setFilter(s)}
            >{s === "all" ? "All" : `${SRC[s].icon} ${SRC[s].label}`}</button>
          ))}
        </div>
        <input className={styles.search} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.grid}>
        {filtered.map(note => (
          <article key={note.id} className={styles.card}>
            <div className={styles.cardBar} style={{ background: SRC[note.source]?.color }} />
            <div className={styles.cardInner}>
              <div className={styles.cardTop}>
                <span className={styles.badge} style={{ color: SRC[note.source]?.color }}>{SRC[note.source]?.icon} {SRC[note.source]?.label}</span>
                <span className={styles.time}>{fmt(note.timestamp)}</span>
              </div>
              <h3 className={styles.cardTitle} onClick={() => setExpanded(expanded === note.id ? null : note.id)}>{note.title}</h3>
              <div className={`${styles.cardBody} ${expanded === note.id ? styles.bodyOpen : ""}`}>
                {renderMd(note.content)}
              </div>
              {note.linkedTask && <div className={styles.linked}>📌 {note.linkedTask}</div>}
              <div className={styles.cardActions}>
                <button className={styles.smallBtn} onClick={() => copy(note)}>📋 Copy</button>
                <button className={styles.smallBtn} onClick={() => del(note.id)} style={{ marginLeft: "auto" }}>🗑</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>New Note</h2>
            <div className={styles.field}>
              <label>Source</label>
              <div className={styles.srcPicker}>
                {(["manual", "ai-chat", "research"] as Source[]).map(s => (
                  <button key={s} className={`${styles.srcBtn} ${source === s ? styles.srcActive : ""}`}
                    style={source === s ? { borderColor: SRC[s].color, background: SRC[s].color + "12" } : {}}
                    onClick={() => setSource(s)} type="button"
                  >{SRC[s].icon} {SRC[s].label}</button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." />
            </div>
            <div className={styles.field}>
              <label>Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Markdown content..." />
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.ghost} onClick={() => setShowCreate(false)} type="button">Cancel</button>
              <button onClick={create} type="button">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
