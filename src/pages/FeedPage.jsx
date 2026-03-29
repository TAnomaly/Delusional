/**
 * Feed/Stream page - Markdown posts with content types and tags.
 * Japanese minimalism: generous whitespace, calm typography.
 */
import { useState, useEffect } from "react";
import { posts } from "../utils/api.js";
import { renderMarkdown } from "../utils/markdown.js";

const CONTENT_TYPES = [
  { value: "note", label: "Note" },
  { value: "tool", label: "Tool" },
  { value: "workflow", label: "Workflow" },
  { value: "resource", label: "Resource" },
  { value: "learning", label: "Learning" },
];

export default function FeedPage() {
  const [feedPosts, setFeedPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    content_type: "note",
    tags: "",
    url: "",
    duration_minutes: 0,
  });
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const res = await posts.feed();
    if (res.data) setFeedPosts(res.data);
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      duration_minutes: parseInt(form.duration_minutes) || 0,
    };
    const res = await posts.create(payload);
    if (res.error) {
      setError(res.error);
      return;
    }
    setForm({
      title: "",
      content: "",
      content_type: "note",
      tags: "",
      url: "",
      duration_minutes: 0,
    });
    setShowForm(false);
    loadFeed();
  };

  const filtered =
    filter === "all" ? feedPosts : feedPosts.filter((p) => p.content_type === filter);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 300 }}>Stream</h1>
          <p className="text-xs text-muted">{feedPosts.length}/20 today</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Share"}
        </button>
      </div>

      {/* New post form */}
      {showForm && (
        <form onSubmit={handlePost} className="card fade-in mb-md">
          {error && <div className="usage-warning">{error}</div>}

          <div className="form-group">
            <label>Title (optional)</label>
            <input
              type="text"
              placeholder="Give it a name..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Content (markdown supported)</label>
            <textarea
              placeholder="Share a tool, thought, workflow, or learning..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={5}
            />
          </div>

          <div className="flex gap-sm">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Type</label>
              <select
                value={form.content_type}
                onChange={(e) => setForm({ ...form, content_type: e.target.value })}
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Tags</label>
              <input
                type="text"
                placeholder="minimalism, tools, focus"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-sm">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Link (optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Time spent (min)</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                min={0}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Publish
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div className="tabs">
        {[{ value: "all", label: "All" }, ...CONTENT_TYPES].map((t) => (
          <button
            key={t.value}
            className={`tab ${filter === t.value ? "active" : ""}`}
            onClick={() => setFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <p className="empty text-muted font-light">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">枯</div>
          <p className="font-light">Nothing here yet.</p>
          <p className="text-xs mt-sm">Share something meaningful.</p>
        </div>
      ) : (
        filtered.map((post) => (
          <article key={post.id} className="card fade-in">
            <div className="flex justify-between align-center mb-sm">
              <span className={`badge badge-${post.content_type}`}>{post.content_type}</span>
              <span className="text-xs text-muted">
                {new Date(post.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {post.title && (
              <h3 style={{ marginBottom: "0.5rem", fontWeight: 400, fontSize: "1.05rem" }}>
                {post.title}
              </h3>
            )}

            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm"
                style={{ display: "block", marginTop: "0.5rem" }}
              >
                ↗ {new URL(post.url).hostname}
              </a>
            )}

            <div className="flex justify-between align-center mt-sm">
              <div>
                {(post.tags || []).map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
              {post.duration_minutes > 0 && (
                <span className="text-xs text-muted">{post.duration_minutes} min</span>
              )}
            </div>
          </article>
        ))
      )}

      {feedPosts.length >= 20 && (
        <div className="card text-center" style={{ background: "var(--accent-bg)" }}>
          <p className="text-sm" style={{ color: "var(--accent)" }}>
            Daily limit reached. Step away, breathe, focus. 🧘
          </p>
        </div>
      )}
    </div>
  );
}
