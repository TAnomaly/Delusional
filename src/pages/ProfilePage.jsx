/**
 * Profile Page - User profile with stats, bio, and settings.
 * Japanese minimalism: clean, personal, reflective.
 */
import { useState, useEffect } from "react";
import { profile, posts, focus } from "../utils/api.js";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    theme: "light",
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalFocusMinutes: 0,
    collections: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);

    // Load user profile
    const profileRes = await profile.me();
    if (profileRes.data) {
      setUser(profileRes.data);
      setFormData({
        display_name: profileRes.data.display_name || "",
        bio: profileRes.data.bio || "",
        avatar_url: profileRes.data.avatar_url || "",
        theme: profileRes.data.theme || "light",
      });
    }

    // Load user's posts
    const postsRes = await posts.my();
    if (postsRes.data) {
      setRecentPosts(postsRes.data.slice(0, 5));
      setStats((s) => ({ ...s, totalPosts: postsRes.data.length }));
    }

    // Load focus stats
    const focusRes = await focus.stats();
    if (focusRes.data) {
      setStats((s) => ({
        ...s,
        totalFocusMinutes: focusRes.data.total_minutes || 0,
      }));
    }

    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await profile.update(formData);
    if (res.data) {
      setUser(res.data);
      setIsEditing(false);
      // Apply theme change
      if (formData.theme) {
        document.documentElement.setAttribute("data-theme", formData.theme);
        localStorage.setItem("theme", formData.theme);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="empty">
        <p className="font-light">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            getInitials(user?.display_name || user?.username)
          )}
        </div>
        <h2 className="profile-name">{user?.display_name || user?.username}</h2>
        <p className="profile-bio">{user?.bio || "No bio yet"}</p>

        <div className="flex justify-center gap-md mt-md">
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 300 }}>{stats.totalPosts}</div>
            <div className="text-xs text-muted">Posts</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 300 }}>
              {Math.round(stats.totalFocusMinutes / 60)}
            </div>
            <div className="text-xs text-muted">Focus Hours</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 300 }}>{user?.streak_days || 0}</div>
            <div className="text-xs text-muted">Day Streak</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm mt-md" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleUpdate}
          className="card fade-in mb-md"
          style={{ maxWidth: "500px", margin: "0 auto 2rem" }}
        >
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              placeholder="A few words about yourself"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Theme</label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      )}

      {/* Recent Posts */}
      <div className="section">
        <div className="section-header">
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600 }}>Recent Posts</h2>
        </div>
        {recentPosts.length === 0 ? (
          <div className="empty" style={{ padding: "2rem 1rem" }}>
            <p className="font-light text-sm">No posts yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {recentPosts.map((post) => (
              <div key={post.id} className="card card-compact">
                <div className="flex justify-between align-center">
                  <div>
                    <span className={`badge badge-${post.content_type}`}>{post.content_type}</span>
                    {post.title && (
                      <span style={{ marginLeft: "0.5rem", fontWeight: 400 }}>{post.title}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="section">
        <div className="section-header">
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600 }}>Account</h2>
        </div>
        <div className="card card-compact">
          <div className="flex justify-between" style={{ marginBottom: "0.5rem" }}>
            <span className="text-sm text-muted">Username</span>
            <span className="text-sm">@{user?.username}</span>
          </div>
          <div className="flex justify-between" style={{ marginBottom: "0.5rem" }}>
            <span className="text-sm text-muted">Email</span>
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted">Member since</span>
            <span className="text-sm">{new Date(user?.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Zen Quote */}
      <div
        className="card text-center"
        style={{ background: "var(--accent-bg)", borderColor: "var(--accent-soft)" }}
      >
        <p
          className="font-serif"
          style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--text-secondary)" }}
        >
          &ldquo;Simplicity is the ultimate sophistication.&rdquo;
        </p>
        <p className="text-xs text-muted mt-sm">— Leonardo da Vinci</p>
      </div>
    </div>
  );
}
