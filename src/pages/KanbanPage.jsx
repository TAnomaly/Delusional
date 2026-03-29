/**
 * Kanban Board Page - Visual project/task management.
 * Japanese minimalism: clean columns, calm interactions, deliberate movements.
 */
import { useState, useEffect } from "react";
import { kanban } from "../utils/api.js";
import { renderMarkdown } from "../utils/markdown.js";

export default function KanbanPage() {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newCardData, setNewCardData] = useState({
    title: "",
    content: "",
    tags: "",
    color: "",
    due_date: "",
  });
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    const res = await kanban.boards();
    if (res.data) setBoards(res.data);
    setLoading(false);
  };

  const loadBoard = async (boardId) => {
    const res = await kanban.getBoard(boardId);
    if (res.data) setActiveBoard(res.data);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    const res = await kanban.createBoard({ title: newBoardTitle });
    if (res.data) {
      setNewBoardTitle("");
      setShowNewBoard(false);
      loadBoards();
    }
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !activeBoard) return;
    const res = await kanban.addColumn(activeBoard.id, { title: newColumnTitle });
    if (res.data) {
      setNewColumnTitle("");
      setShowNewColumn(false);
      loadBoard(activeBoard.id);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardData.title.trim() || !selectedColumnId) return;
    const res = await kanban.createCard(selectedColumnId, {
      ...newCardData,
      tags: newCardData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      due_date: newCardData.due_date || null,
    });
    if (res.data) {
      setNewCardData({ title: "", content: "", tags: "", color: "", due_date: "" });
      setShowNewCard(false);
      setSelectedColumnId(null);
      loadBoard(activeBoard.id);
    }
  };

  const handleUpdateCard = async (cardId, updates) => {
    const res = await kanban.updateCard(cardId, updates);
    if (res.data) {
      loadBoard(activeBoard.id);
    }
  };

  const handleDeleteCard = async (cardId) => {
    const res = await kanban.deleteCard(cardId);
    if (res.data) {
      loadBoard(activeBoard.id);
    }
  };

  const handleArchiveBoard = async (boardId) => {
    const res = await kanban.archiveBoard(boardId);
    if (res.data) {
      setActiveBoard(null);
      loadBoards();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.column_id === targetColumnId) return;

    // Update card's column
    await handleUpdateCard(draggedCard.id, { column_id: targetColumnId });
    setDraggedCard(null);
  };

  const openNewCardModal = (columnId) => {
    setSelectedColumnId(columnId);
    setShowNewCard(true);
  };

  if (loading) {
    return (
      <div className="empty">
        <p className="font-light">Loading boards...</p>
      </div>
    );
  }

  // Board selection view
  if (!activeBoard) {
    return (
      <div className="fade-in">
        <div className="section-header">
          <h1 style={{ fontSize: "1.3rem", fontWeight: 300 }}>Boards</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewBoard(true)}>
            + New Board
          </button>
        </div>

        {showNewBoard && (
          <form onSubmit={handleCreateBoard} className="card fade-in mb-md">
            <div className="form-group">
              <label>Board Title</label>
              <input
                type="text"
                placeholder="e.g., Study Plan, Project Alpha, Learning Goals"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="btn btn-primary">
                Create
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowNewBoard(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {boards.length === 0 ? (
          <div className="empty" style={{ padding: "4rem 1rem" }}>
            <div className="empty-icon">空</div>
            <p className="font-light">No boards yet.</p>
            <p className="text-xs mt-sm">
              Create your first Kanban board for tasks, projects, or study plans.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="card"
                style={{
                  cursor: "pointer",
                  borderTop: `4px solid ${board.color || "#d4c5a9"}`,
                }}
                onClick={() => loadBoard(board.id)}
              >
                <h3 style={{ fontWeight: 400, marginBottom: "0.25rem" }}>{board.title}</h3>
                {board.description && (
                  <p className="text-sm" style={{ marginBottom: "0.5rem" }}>
                    {board.description}
                  </p>
                )}
                <span className="text-xs text-muted">
                  {new Date(board.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Board detail view
  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="flex align-center gap-md">
          <button className="btn btn-ghost" onClick={() => setActiveBoard(null)}>
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 300 }}>{activeBoard.title}</h1>
            {activeBoard.description && (
              <p className="text-xs text-muted">{activeBoard.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowNewColumn(true)}>
            + Column
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleArchiveBoard(activeBoard.id)}
          >
            Archive
          </button>
        </div>
      </div>

      {/* New Column Form */}
      {showNewColumn && (
        <form
          onSubmit={handleCreateColumn}
          className="card fade-in mb-md"
          style={{ maxWidth: "400px" }}
        >
          <div className="form-group">
            <label>Column Title</label>
            <input
              type="text"
              placeholder="e.g., Backlog, Ready, Review"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-sm">
            <button type="submit" className="btn btn-primary">
              Add
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowNewColumn(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="kanban-board">
        {activeBoard.columns.map((column) => (
          <div key={column.id} className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-title">{column.title}</span>
              <span className="kanban-column-count">{column.cards?.length || 0}</span>
            </div>

            <div
              className="kanban-cards"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {(column.cards || []).map((card) => (
                <div
                  key={card.id}
                  className={`kanban-card ${card.is_completed ? "completed" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onClick={() => setEditingCard(card)}
                  style={{ borderLeft: card.color ? `3px solid ${card.color}` : undefined }}
                >
                  <div className="kanban-card-title">{card.title}</div>
                  {card.content && (
                    <div
                      className="kanban-card-content markdown-preview"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(
                          card.content.substring(0, 100) + (card.content.length > 100 ? "..." : ""),
                        ),
                      }}
                    />
                  )}
                  {(card.tags || []).map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                  {card.due_date && (
                    <div className="text-xs text-muted mt-sm">
                      Due: {new Date(card.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="btn btn-ghost btn-sm mt-sm"
              onClick={() => openNewCardModal(column.id)}
              style={{ width: "100%" }}
            >
              + Add Card
            </button>
          </div>
        ))}
      </div>

      {/* New Card Modal */}
      {showNewCard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowNewCard(false)}
        >
          <div
            className="card fade-in"
            style={{ maxWidth: "500px", width: "90%", maxHeight: "80vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem", fontWeight: 400 }}>New Card</h3>
            <form onSubmit={handleCreateCard}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Task or idea title"
                  value={newCardData.title}
                  onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Content (markdown)</label>
                <textarea
                  placeholder="Details, notes, or description"
                  value={newCardData.content}
                  onChange={(e) => setNewCardData({ ...newCardData, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-sm">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tags</label>
                  <input
                    type="text"
                    placeholder="urgent, idea, research"
                    value={newCardData.tags}
                    onChange={(e) => setNewCardData({ ...newCardData, tags: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Color</label>
                  <input
                    type="color"
                    value={newCardData.color || "#d4c5a9"}
                    onChange={(e) => setNewCardData({ ...newCardData, color: e.target.value })}
                    style={{ height: "42px", padding: "2px" }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newCardData.due_date}
                  onChange={(e) => setNewCardData({ ...newCardData, due_date: e.target.value })}
                />
              </div>
              <div className="flex gap-sm">
                <button type="submit" className="btn btn-primary">
                  Create Card
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewCard(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <EditCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
}

function EditCardModal({ card, onClose, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    title: card.title,
    content: card.content || "",
    tags: (card.tags || []).join(", "),
    color: card.color || "",
    due_date: card.due_date ? card.due_date.split("T")[0] : "",
    is_completed: card.is_completed,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(card.id, {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      due_date: formData.due_date || null,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in"
        style={{ maxWidth: "500px", width: "90%", maxHeight: "80vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: "1rem", fontWeight: 400 }}>Edit Card</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Content (markdown)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
          </div>
          <div className="flex gap-sm">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Color</label>
              <input
                type="color"
                value={formData.color || "#d4c5a9"}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{ height: "42px", padding: "2px" }}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={formData.is_completed}
                onChange={(e) => setFormData({ ...formData, is_completed: e.target.checked })}
                style={{ width: "auto" }}
              />
              Mark as completed
            </label>
          </div>
          <div className="flex gap-sm" style={{ justifyContent: "space-between" }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                onDelete(card.id);
                onClose();
              }}
            >
              Delete
            </button>
            <div className="flex gap-sm">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
