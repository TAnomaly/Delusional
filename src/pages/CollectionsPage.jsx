/**
 * Collections Page - Curated collections of tools, apps, workflows.
 * Japanese minimalism: organized, intentional, quality over quantity.
 */
import { useState, useEffect } from "react";
import { collections } from "../utils/api.js";

const RESOURCE_TYPES = [
  { value: "tool", label: "Tool" },
  { value: "app", label: "App" },
  { value: "workflow", label: "Workflow" },
  { value: "article", label: "Article" },
  { value: "note", label: "Note" },
];

export default function CollectionsPage() {
  const [myCollections, setMyCollections] = useState([]);
  const [publicCollections, setPublicCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [view, setView] = useState("mine"); // 'mine' or 'public'
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newCollectionData, setNewCollectionData] = useState({
    title: "",
    description: "",
    is_public: true,
  });
  const [newItemData, setNewItemData] = useState({
    title: "",
    description: "",
    url: "",
    resource_type: "tool",
    tags: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, [view]);

  const loadCollections = async () => {
    setLoading(true);
    if (view === "mine") {
      const res = await collections.list();
      if (res.data) setMyCollections(res.data);
    } else {
      const res = await collections.public();
      if (res.data) setPublicCollections(res.data);
    }
    setLoading(false);
  };

  const loadCollection = async (id) => {
    const res = await collections.get(id);
    if (res.data) setActiveCollection(res.data);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionData.title.trim()) return;
    const res = await collections.create(newCollectionData);
    if (res.data) {
      setNewCollectionData({ title: "", description: "", is_public: true });
      setShowNewCollection(false);
      loadCollections();
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemData.title.trim() || !activeCollection) return;
    const res = await collections.addItem(activeCollection.id, {
      ...newItemData,
      tags: newItemData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (res.data) {
      setNewItemData({ title: "", description: "", url: "", resource_type: "tool", tags: "" });
      setShowNewItem(false);
      loadCollection(activeCollection.id);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!activeCollection) return;
    const res = await collections.removeItem(activeCollection.id, itemId);
    if (res.data) {
      loadCollection(activeCollection.id);
    }
  };

  const collectionsToDisplay = view === "mine" ? myCollections : publicCollections;

  if (loading) {
    return (
      <div className="empty">
        <p className="font-light">Loading collections...</p>
      </div>
    );
  }

  // Collection detail view
  if (activeCollection) {
    return (
      <div className="fade-in">
        <div className="section-header">
          <div className="flex align-center gap-md">
            <button className="btn btn-ghost" onClick={() => setActiveCollection(null)}>
              ← Back
            </button>
            <div>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 300 }}>{activeCollection.title}</h1>
              {activeCollection.description && (
                <p className="text-xs text-muted">{activeCollection.description}</p>
              )}
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewItem(true)}>
            + Add Item
          </button>
        </div>

        {/* New Item Form */}
        {showNewItem && (
          <form onSubmit={handleAddItem} className="card fade-in mb-md">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., Obsidian, Notion, Pomodoro Timer"
                value={newItemData.title}
                onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Why is this valuable? How do you use it?"
                value={newItemData.description}
                onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-sm">
              <div className="form-group" style={{ flex: 2 }}>
                <label>URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newItemData.url}
                  onChange={(e) => setNewItemData({ ...newItemData, url: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Type</label>
                <select
                  value={newItemData.resource_type}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, resource_type: e.target.value })
                  }
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="productivity, note-taking, focus"
                value={newItemData.tags}
                onChange={(e) => setNewItemData({ ...newItemData, tags: e.target.value })}
              />
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="btn btn-primary">
                Add Item
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowNewItem(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Collection Items */}
        {(activeCollection.items || []).length === 0 ? (
          <div className="empty" style={{ padding: "3rem 1rem" }}>
            <div className="empty-icon">集</div>
            <p className="font-light">No items yet.</p>
            <p className="text-xs mt-sm">Add your first tool, app, or workflow.</p>
          </div>
        ) : (
          <div className="grid-2">
            {(activeCollection.items || []).map((item) => (
              <article key={item.id} className="card">
                <div className="flex justify-between align-center mb-sm">
                  <span className={`badge badge-${item.resource_type}`}>{item.resource_type}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
                <h3 style={{ fontWeight: 400, marginBottom: "0.5rem" }}>{item.title}</h3>
                {item.description && (
                  <p className="text-sm" style={{ marginBottom: "0.5rem", lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ display: "block", marginBottom: "0.5rem" }}
                  >
                    ↗ {new URL(item.url).hostname}
                  </a>
                )}
                {(item.tags || []).map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Collections list view
  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 300 }}>Collections</h1>
          <p className="text-xs text-muted">Curated tools, apps, and workflows</p>
        </div>
        {view === "mine" && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewCollection(true)}>
            + New Collection
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="tabs" style={{ maxWidth: "200px", marginBottom: "1.5rem" }}>
        <button
          className={`tab ${view === "mine" ? "active" : ""}`}
          onClick={() => setView("mine")}
        >
          Mine
        </button>
        <button
          className={`tab ${view === "public" ? "active" : ""}`}
          onClick={() => setView("public")}
        >
          Public
        </button>
      </div>

      {/* New Collection Form */}
      {showNewCollection && (
        <form onSubmit={handleCreateCollection} className="card fade-in mb-md">
          <div className="form-group">
            <label>Collection Title</label>
            <input
              type="text"
              placeholder="e.g., My Productivity Stack, Learning Resources, Minimalist Tools"
              value={newCollectionData.title}
              onChange={(e) =>
                setNewCollectionData({ ...newCollectionData, title: e.target.value })
              }
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="What is this collection about?"
              value={newCollectionData.description}
              onChange={(e) =>
                setNewCollectionData({ ...newCollectionData, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="form-group">
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={newCollectionData.is_public}
                onChange={(e) =>
                  setNewCollectionData({ ...newCollectionData, is_public: e.target.checked })
                }
                style={{ width: "auto" }}
              />
              <span className="text-sm">Make public (others can browse)</span>
            </label>
          </div>
          <div className="flex gap-sm">
            <button type="submit" className="btn btn-primary">
              Create Collection
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowNewCollection(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      {collectionsToDisplay.length === 0 ? (
        <div className="empty" style={{ padding: "4rem 1rem" }}>
          <div className="empty-icon">{view === "mine" ? "空" : "探"}</div>
          <p className="font-light">
            {view === "mine" ? "No collections yet." : "No public collections found."}
          </p>
          <p className="text-xs mt-sm">
            {view === "mine"
              ? "Create your first curated collection of tools and resources."
              : "Check back later for community collections."}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {collectionsToDisplay.map((collection) => (
            <div
              key={collection.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => loadCollection(collection.id)}
            >
              <h3 style={{ fontWeight: 400, marginBottom: "0.25rem" }}>{collection.title}</h3>
              {collection.description && (
                <p className="text-sm" style={{ marginBottom: "0.75rem", lineHeight: 1.6 }}>
                  {collection.description}
                </p>
              )}
              <div className="flex justify-between align-center">
                <span className="text-xs text-muted">{collection.items?.length || 0} items</span>
                {!collection.is_public && (
                  <span
                    className="badge"
                    style={{ background: "var(--bg-accent)", color: "var(--text-tertiary)" }}
                  >
                    Private
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
