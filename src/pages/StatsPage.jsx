/**
 * Stats page - weekly analytics and AI summaries.
 * Minimal, non-addictive presentation.
 */
import { useState, useEffect } from "react";
import { analytics, focus } from "../utils/api.js";

export default function StatsPage() {
  const [weekly, setWeekly] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [weeklyRes, statsRes] = await Promise.all([analytics.weekly(), focus.stats()]);
    if (weeklyRes.data) setWeekly(weeklyRes.data);
    if (statsRes.data) setStats(statsRes.data);
    setLoading(false);
  };

  if (loading) return <p className="empty">Loading...</p>;

  return (
    <div>
      <h2>Your Progress</h2>
      <p className="text-sm text-muted">Quiet reflection, not dopamine hits.</p>

      {/* Current stats */}
      {stats && (
        <div className="card mt-1">
          <h2>Overview</h2>
          <div className="flex justify-between mt-1">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{stats.total_focus_minutes}</div>
              <span className="text-sm text-muted">Total minutes</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{stats.total_sessions}</div>
              <span className="text-sm text-muted">Sessions</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>🔥 {stats.streak_days}</div>
              <span className="text-sm text-muted">Day streak</span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly summaries */}
      <h2 className="mt-2">Weekly Summaries</h2>
      {weekly.length === 0 ? (
        <div className="empty">
          <p>No weekly summaries yet.</p>
          <p className="text-sm mt-1">Keep focusing and they &apos;ll appear here.</p>
        </div>
      ) : (
        weekly.map((w) => (
          <div key={w.id} className="card">
            <div className="flex justify-between align-center">
              <span className="text-sm text-muted">
                Week of {new Date(w.week_start).toLocaleDateString()}
              </span>
              <span className="text-sm">{w.total_focus_minutes} min focused</span>
            </div>
            {w.ai_summary && (
              <p className="mt-1" style={{ color: "var(--text)", fontSize: "0.9rem" }}>
                {w.ai_summary}
              </p>
            )}
            {w.top_tags && Object.keys(w.top_tags).length > 0 && (
              <div className="mt-1">
                {Object.entries(w.top_tags).map(([tag, count]) => (
                  <span key={tag} className="tag">
                    #{tag} ({count})
                  </span>
                ))}
              </div>
            )}
            {w.ai_suggestions && Object.keys(w.ai_suggestions).length > 0 && (
              <div className="mt-1" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {Object.values(w.ai_suggestions).map((s, i) => (
                  <div key={i}>💡 {s}</div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Encouragement to leave */}
      <div className="card mt-2" style={{ textAlign: "center", background: "#f0fdf4" }}>
        <p style={{ color: "var(--success)", fontSize: "0.9rem" }}>
          🧘 You &apos;ve reviewed your stats. Now close the app and focus on real life.
        </p>
      </div>
    </div>
  );
}
