/**
 * Focus page - Pomodoro timer with fullscreen focus mode.
 * Max 3 components visible in focus mode.
 */
import { useState, useEffect, useRef } from "react";
import { focus } from "../utils/api.js";

export default function FocusPage() {
  const [activeSession, setActiveSession] = useState(null);
  const [taskInput, setTaskInput] = useState("");
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadActive();
    loadHistory();
    loadStats();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && isFocusMode) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && activeSession && isFocusMode) {
      // Timer complete
      handleEnd(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isFocusMode]);

  const loadActive = async () => {
    const res = await focus.active();
    if (res.data) {
      setActiveSession(res.data);
      const elapsed = Math.floor((Date.now() - new Date(res.data.started_at).getTime()) / 1000);
      const remaining = Math.max(0, res.data.duration_minutes * 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining > 0) setIsFocusMode(true);
    }
  };

  const loadHistory = async () => {
    const res = await focus.history();
    if (res.data) setHistory(res.data);
  };

  const loadStats = async () => {
    const res = await focus.stats();
    if (res.data) setStats(res.data);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const res = await focus.start({
      task_description: taskInput,
      duration_minutes: duration,
    });
    if (res.error) return;
    setActiveSession(res.data);
    setTimeLeft(duration * 60);
    setIsFocusMode(true);
    setTaskInput("");
  };

  const handleEnd = async (completed) => {
    if (!activeSession) return;
    await focus.end(activeSession.id, { completed });
    setActiveSession(null);
    setIsFocusMode(false);
    setTimeLeft(0);
    clearTimeout(timerRef.current);
    loadHistory();
    loadStats();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Focus Mode - fullscreen, only timer + task + exit button (3 components max)
  if (isFocusMode && activeSession) {
    return (
      <div className="focus-mode">
        <div className="focus-timer">{formatTime(timeLeft)}</div>
        <div className="focus-task">{activeSession.task_description}</div>
        <div className="flex gap-sm">
          <button className="btn btn-primary" onClick={() => handleEnd(true)}>
            ✓ Complete
          </button>
          <button className="btn btn-secondary" onClick={() => handleEnd(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between align-center">
        <h2>Focus Timer</h2>
        {stats && <span className="streak">🔥 {stats.streak_days} day streak</span>}
      </div>

      {/* Start new session */}
      <form onSubmit={handleStart} className="card mt-1">
        <div className="form-group">
          <label>What will you focus on?</label>
          <input
            type="text"
            placeholder="e.g., Study chapter 3, Write essay..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            required
            maxLength={500}
          />
        </div>
        <div className="flex gap-sm align-center">
          <div className="form-group" style={{ width: "120px", marginBottom: 0 }}>
            <label>Minutes</label>
            <input
              type="number"
              value={duration}
              onChange={(e) =>
                setDuration(Math.min(120, Math.max(1, parseInt(e.target.value) || 25)))
              }
              min={1}
              max={120}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Start Focus 🧘
          </button>
        </div>
      </form>

      {/* Stats */}
      {stats && (
        <div className="card">
          <div className="flex justify-between">
            <div>
              <span className="text-sm text-muted">Total focus</span>
              <div style={{ fontWeight: 600 }}>{stats.total_focus_minutes} min</div>
            </div>
            <div>
              <span className="text-sm text-muted">Sessions</span>
              <div style={{ fontWeight: 600 }}>{stats.total_sessions}</div>
            </div>
            <div>
              <span className="text-sm text-muted">Streak</span>
              <div style={{ fontWeight: 600 }}>🔥 {stats.streak_days}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent history */}
      <h2 className="mt-2">Recent Sessions</h2>
      {history.length === 0 ? (
        <div className="empty">
          <p>No sessions yet. Start your first focus session!</p>
        </div>
      ) : (
        history.slice(0, 10).map((s) => (
          <div key={s.id} className="card">
            <div className="flex justify-between align-center">
              <span>{s.task_description}</span>
              <span className="text-sm text-muted">
                {s.completed ? "✓" : "✗"} {s.duration_minutes}min
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
