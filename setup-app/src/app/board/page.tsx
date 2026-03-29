"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Card {
  id: number;
  text: string;
  tag: string;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  icon: string;
  cards: Card[];
}

const INITIAL_COLS: Column[] = [
  { id: "backlog", title: "Backlog", icon: "📋", cards: [
    { id: 1, text: "Mekanik klavye araştırması yap", tag: "research", createdAt: "10:30" },
    { id: 2, text: "Kablo düzenleme sistemi kur", tag: "project", createdAt: "09:15" }
  ]},
  { id: "doing", title: "In Progress", icon: "⚡", cards: [
    { id: 3, text: "Monitör karşılaştırması — Dell vs LG", tag: "research", createdAt: "11:00" }
  ]},
  { id: "done", title: "Done", icon: "✓", cards: [
    { id: 4, text: "Masa planı eskizi çiz", tag: "task", createdAt: "16:00" },
  ]}
];

export default function BoardPage() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLS);
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [newTag, setNewTag] = useState("task");

  const addCard = (colId: string) => {
    if (!newText.trim()) return;
    setColumns(prev => prev.map(col =>
      col.id === colId ? {
        ...col,
        cards: [...col.cards, { id: Date.now(), text: newText, tag: newTag, createdAt: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }]
      } : col
    ));
    setNewText("");
    setNewTag("task");
    setShowAdd(null);
  };

  const moveCard = (cardId: number, fromCol: string, direction: "left" | "right") => {
    const colIdx = columns.findIndex(c => c.id === fromCol);
    const targetIdx = direction === "right" ? colIdx + 1 : colIdx - 1;
    if (targetIdx < 0 || targetIdx >= columns.length) return;

    let movedCard: Card | null = null;
    setColumns(prev => {
      const updated = prev.map(col => {
        if (col.id === fromCol) {
          movedCard = col.cards.find(c => c.id === cardId) || null;
          return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
        }
        return col;
      });
      if (movedCard) {
        updated[targetIdx] = { ...updated[targetIdx], cards: [...updated[targetIdx].cards, movedCard] };
      }
      return updated;
    });
  };

  const deleteCard = (colId: string, cardId: number) => {
    setColumns(prev => prev.map(col =>
      col.id === colId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
    ));
  };

  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.header}>
        <div>
          <p className={styles.label}>▦ Board</p>
          <h1>Task <span>Board</span></h1>
          <p className={styles.desc}>AI tarafından oluşturulan görevlerin burada. Kartları sürükle veya ok butonlarıyla taşı.</p>
        </div>
      </section>

      <div className={styles.board}>
        {columns.map((col, colIdx) => (
          <div key={col.id} className={styles.col}>
            <div className={styles.colHead}>
              <span className={styles.colIcon}>{col.icon}</span>
              <h2>{col.title}</h2>
              <span className={styles.count}>{col.cards.length}</span>
            </div>
            <div className={styles.cards}>
              {col.cards.map(card => (
                <div key={card.id} className={styles.card}>
                  <p className={styles.cardText}>{card.text}</p>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardTag}>{card.tag}</span>
                    <span className={styles.cardTime}>{card.createdAt}</span>
                  </div>
                  <div className={styles.cardActions}>
                    {colIdx > 0 && (
                      <button className={styles.moveBtn} onClick={() => moveCard(card.id, col.id, "left")}>←</button>
                    )}
                    {colIdx < columns.length - 1 && (
                      <button className={styles.moveBtn} onClick={() => moveCard(card.id, col.id, "right")}>→</button>
                    )}
                    <button className={styles.delBtn} onClick={() => deleteCard(col.id, card.id)}>✕</button>
                  </div>
                </div>
              ))}

              {showAdd === col.id ? (
                <div className={styles.addForm}>
                  <textarea
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    placeholder="Görev açıklaması..."
                    rows={2}
                    autoFocus
                  />
                  <div className={styles.addFormRow}>
                    <select value={newTag} onChange={e => setNewTag(e.target.value)}>
                      <option value="task">task</option>
                      <option value="research">research</option>
                      <option value="project">project</option>
                      <option value="idea">idea</option>
                    </select>
                    <div className={styles.addBtns}>
                      <button className={styles.addConfirm} onClick={() => addCard(col.id)}>Add</button>
                      <button className={styles.addCancel} onClick={() => { setShowAdd(null); setNewText(""); }}>✕</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className={styles.addBtn} onClick={() => setShowAdd(col.id)}>+ Add card</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
