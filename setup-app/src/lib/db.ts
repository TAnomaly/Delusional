// In-memory mock database for the application

export const db = {
  users: [
    {
      username: "alex_dev",
      displayName: "Alex Johnson",
      bio: "Software engineer & minimalist desk enthusiast.",
      followers: 1204,
      following: 89,
    }
  ],
  posts: [
    {
      id: 1,
      user: "alex_dev",
      title: "Minimal Mac Studio Setup",
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800",
      tags: ["mac", "minimal", "productivity"],
      likes: 128
    },
    {
      id: 2,
      user: "sarah_codes",
      title: "Dual Monitor Coding Station",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
      tags: ["developer", "ultrawide"],
      likes: 342
    },
    {
      id: 3,
      user: "mike_design",
      title: "Monochrome Perfection",
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800",
      tags: ["monochrome", "design"],
      likes: 89
    }
  ],
  kanban: [
    {
      id: "todo",
      title: "Ideas / To Buy",
      cards: [
        { id: 1, text: "Buy new mechanical keyboard switch" },
        { id: 2, text: "Cable management under desk" }
      ]
    },
    {
      id: "in-progress",
      title: "In Progress",
      cards: [
        { id: 3, text: "Mounting secondary monitor" }
      ]
    },
    {
      id: "done",
      title: "Completed",
      cards: [
        { id: 4, text: "Cleaned PC dust filters" },
        { id: 5, text: "Ordered new desk mat" }
      ]
    }
  ],
  notes: [
    {
      id: 1,
      title: "Claude ile monitör araştırması",
      content: "Claude'a sordum: 27\" vs 32\" monitör karşılaştırması yaptık.\n\n**Sonuç:** 27\" 4K, masa derinliği 60cm altındaysa en ideali. PPI açısından üstün.\n\n- Dell U2723QE önerildi\n- LG 27UN850 alternatif",
      source: "claude",
      timestamp: "2026-03-29T10:30:00Z",
      kanbanCardId: null
    },
    {
      id: 2,
      title: "Gemini ile kablo yönetimi fikirleri",
      content: "Gemini'den aldığım öneriler:\n\n1. **Kablo kanalı**: IKEA SIGNUM\n2. **Velcro bant**: reusable cable ties\n3. **Under-desk tray**: mount edilen tepsi sistemi\n\n> \"Minimal masanın sırrı, kablonun görünmemesidir\" — Gemini",
      source: "gemini",
      timestamp: "2026-03-29T09:15:00Z",
      kanbanCardId: 2
    },
    {
      id: 3,
      title: "Notion — Setup İlham Panosu",
      content: "Notion'daki ilham panosundan alıntılar:\n\n- Siyah-beyaz tema, hiç RGB yok\n- Tek monitör + laptop dock\n- Bitki: snake plant veya pothos\n- Masa lambası: Dyson Solarcycle",
      source: "notion",
      notionUrl: "https://notion.so/workspace/setup-inspiration-abc123",
      timestamp: "2026-03-28T14:00:00Z",
      kanbanCardId: null
    },
    {
      id: 4,
      title: "Obsidian — Ergonomi Notları",
      content: "## Ergonomik Setup Kuralları\n\n- Monitör üst kenarı göz hizasında\n- Kol dayama 90°\n- Ayaklar yere düz basmalı\n- Her 20dk bir 20-20-20 kuralı\n\n[[setup-ergonomi]] [[sağlık]]",
      source: "obsidian",
      obsidianUri: "obsidian://open?vault=MyVault&file=setup-ergonomi",
      timestamp: "2026-03-27T11:00:00Z",
      kanbanCardId: null
    },
    {
      id: 5,
      title: "Yeni masa planı eskizi",
      content: "160x80cm masa, sol tarafta monitör, sağ tarafta notebook standı.\n\nAltına da küçük bir çekmece ünitesi koyulacak.\n\nBütçe: ~5000 TL",
      source: "manual",
      timestamp: "2026-03-29T16:00:00Z",
      kanbanCardId: 1
    }
  ]
};
