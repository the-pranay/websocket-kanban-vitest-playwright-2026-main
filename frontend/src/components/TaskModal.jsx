import React, { useState, useRef } from "react";

const UPLOAD_URL = "http://localhost:5000/upload";

/**
 * Modal form for creating or editing a task.
 * Supports title, description, priority, category, and file upload.
 */
function TaskModal({ task, onSave, onClose }) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [category, setCategory] = useState(task?.category || "feature");
  const [attachments, setAttachments] = useState(task?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [titleError, setTitleError] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTitleError("");

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      attachments,
    };

    if (isEditing) {
      data.id = task.id;
    }

    onSave(data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setUploadError(result.error || "Upload failed");
        setUploading(false);
        return;
      }

      setAttachments((prev) => [
        ...prev,
        {
          url: result.url,
          name: result.name,
          size: result.size,
          type: result.type,
        },
      ]);
    } catch {
      setUploadError("Failed to upload file. Is the server running?");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type) => type && type.startsWith("image/");

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      data-testid="task-modal-overlay"
    >
      <div className="modal" role="dialog" aria-modal="true" data-testid="task-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-btn"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Title
              </label>
              <input
                id="task-title"
                className="form-input"
                type="text"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="task-title-input"
                autoFocus
              />
              {titleError && (
                <span className="form-error" data-testid="title-error">
                  {titleError}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                className="form-textarea"
                placeholder="Describe the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="task-description-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  Priority
                </label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  data-testid="task-priority-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-category">
                  Category
                </label>
                <select
                  id="task-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  data-testid="task-category-select"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="enhancement">Enhancement</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Attachments</label>

              <div className="file-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  data-testid="file-upload-input"
                  accept="image/*,.pdf,.txt,.doc,.docx"
                />
                <div className="file-upload-icon">+</div>
                <div className="file-upload-text">
                  {uploading
                    ? "Uploading..."
                    : "Click or drag to upload a file"}
                </div>
                <div className="file-upload-hint">
                  Images, PDF, TXT, DOC — max 5MB
                </div>
              </div>

              {uploadError && (
                <div className="upload-error" data-testid="upload-error">
                  {uploadError}
                </div>
              )}

              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="file-preview"
                  data-testid={`attachment-preview-${idx}`}
                >
                  {isImage(att.type) ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="file-preview-image"
                    />
                  ) : (
                    <div className="file-preview-image" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-muted)",
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                    }}>
                      DOC
                    </div>
                  )}
                  <div className="file-preview-info">
                    <div className="file-preview-name">{att.name}</div>
                    <div className="file-preview-size">
                      {formatSize(att.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => removeAttachment(idx)}
                    aria-label={`Remove ${att.name}`}
                    data-testid={`remove-attachment-${idx}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              data-testid="modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              data-testid="modal-save-btn"
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
