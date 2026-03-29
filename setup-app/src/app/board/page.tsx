"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";
import { DashboardLayout } from "@/components/DashboardLayout";

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
  const [activeTab, setActiveTab] = useState<string>("backlog");
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

  const activeColIdx = columns.findIndex(c => c.id === activeTab);
  const activeCol = columns[activeColIdx];

  const getCardColorClass = (colId: string) => {
    if (colId === "backlog") return styles.cardBacklog;
    if (colId === "doing") return styles.cardDoing;
    if (colId === "done") return styles.cardDone;
    return "";
  };

  return (
    <DashboardLayout>
      <div className={`container ${styles.page}`}>
        <section className={styles.header}>
          <div>
            <p className={styles.label}>▦ Workspace</p>
            <h1>Task <span>Board</span></h1>
            <p className={styles.desc}>AI tarafından oluşturulan görevlerin burada. Hedeflerine odaklan.</p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className={styles.tabBar}>
          {columns.map(col => (
            <button
              key={col.id}
              className={`${styles.tabBtn} ${activeTab === col.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(col.id)}
            >
              <span className={styles.tabIcon}>{col.icon}</span>
              {col.title}
              <span className={styles.tabCount}>{col.cards.length}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Content (Grid Layout) */}
        <div className={styles.activeBoardArea}>
          {activeCol && (
            <div className={styles.singleColumn}>
              <motion.div layout className={styles.cardsGrid}>
                <AnimatePresence mode="popLayout">
                  {activeCol.cards.map((card, idx) => (
                    <motion.div 
                      key={card.id} 
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, delay: idx * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                      className={`${styles.card} ${getCardColorClass(activeCol.id)} group`}
                      style={{ position: 'relative', overflow: 'hidden' }}
                    >
                      {/* Ambient Glare on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />
                      
                      <p className={styles.cardText}>{card.text}</p>
                      <div className={styles.cardBottom}>
                        <span className={styles.cardTag}>{card.tag}</span>
                        <span className={styles.cardTime}>{card.createdAt}</span>
                      </div>
                      <div className={styles.cardActions}>
                        {activeColIdx > 0 && (
                          <button className={styles.moveBtn} onClick={() => moveCard(card.id, activeCol.id, "left")}>
                            ← Move to {columns[activeColIdx - 1].title}
                          </button>
                        )}
                        {activeColIdx < columns.length - 1 && (
                          <button className={styles.moveBtn} onClick={() => moveCard(card.id, activeCol.id, "right")}>
                            Move to {columns[activeColIdx + 1].title} →
                          </button>
                        )}
                        <button className={styles.delBtn} onClick={() => deleteCard(activeCol.id, card.id)}>✕</button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Card Form inline with Grid */}
                  {showAdd === activeCol.id ? (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className={`${styles.card} ${styles.addFormCard}`}
                    >
                      <textarea
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        placeholder="Yeni görev..."
                        rows={3}
                        autoFocus
                        className={styles.addTextarea}
                      />
                      <div className={styles.addFormRow}>
                        <select className={styles.tagSelect} value={newTag} onChange={e => setNewTag(e.target.value)}>
                          <option value="task">task</option>
                          <option value="research">research</option>
                          <option value="project">project</option>
                          <option value="idea">idea</option>
                        </select>
                        <div className={styles.addBtns}>
                          <button className={styles.addCancel} onClick={() => { setShowAdd(null); setNewText(""); }}>✕</button>
                          <button className={styles.addConfirm} onClick={() => addCard(activeCol.id)}>Ekle</button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button 
                      layout
                      whileHover={{ scale: 0.98, backgroundColor: "rgba(0,0,0,0.02)" }}
                      whileTap={{ scale: 0.96 }}
                      className={styles.addBtnGrid} 
                      onClick={() => setShowAdd(activeCol.id)}
                    >
                      <span className={styles.addPlus}>+</span>
                      Yeni Görev Ekle
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
