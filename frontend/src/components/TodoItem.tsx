import React, { useState } from 'react';
import { Todo, TodoUpdate, Project } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, updates: TodoUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  projects: Project[];
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete, projects }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState<1 | 2 | 3>(todo.priority);
  const [editProjectId, setEditProjectId] = useState(todo.project_id);
  const [editDueDate, setEditDueDate] = useState(
    todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : ''
  );

  const priorityColors = {
    1: '#4CAF50', // 低優先度 - 緑
    2: '#FF9800', // 中優先度 - オレンジ
    3: '#F44336', // 高優先度 - 赤
  };

  const priorityLabels = {
    1: '低',
    2: '中',
    3: '高',
  };

  const handleToggleComplete = async () => {
    await onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleSaveEdit = async () => {
    await onUpdate(todo.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      project_id: editProjectId,
      due_date: editDueDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditProjectId(todo.project_id);
    setEditDueDate(
      todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : ''
    );
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentProject = projects.find(p => p.id === todo.project_id);

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-header">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="todo-checkbox"
        />
        <div className="todo-content">
          {isEditing ? (
            <div className="todo-edit">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="todo-title-input"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="todo-description-input"
                placeholder="説明（オプション）"
                rows={3}
              />
              
              <div className="todo-edit-fields">
                <div className="form-group">
                  <label htmlFor="edit-priority">優先度:</label>
                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) => setEditPriority(Number(e.target.value) as 1 | 2 | 3)}
                    className="todo-select"
                  >
                    <option value={1}>低</option>
                    <option value={2}>中</option>
                    <option value={3}>高</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-project">プロジェクト:</label>
                  <select
                    id="edit-project"
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(Number(e.target.value))}
                    className="todo-select"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-due-date">期限:</label>
                  <input
                    type="datetime-local"
                    id="edit-due-date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="todo-date-input"
                  />
                </div>
              </div>

              <div className="todo-edit-actions">
                <button onClick={handleSaveEdit} className="save-btn">
                  保存
                </button>
                <button onClick={handleCancelEdit} className="cancel-btn">
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="todo-display">
              <h3 className="todo-title">{todo.title}</h3>
              {todo.description && (
                <p className="todo-description">{todo.description}</p>
              )}
              <div className="todo-meta">
                <span 
                  className="todo-priority"
                  style={{ color: priorityColors[todo.priority] }}
                >
                  優先度: {priorityLabels[todo.priority]}
                </span>
                <span className="todo-project">
                  プロジェクト: {todo.project_name}
                  {currentProject && (
                    <span 
                      className="project-color-indicator"
                      style={{ backgroundColor: currentProject.color }}
                    ></span>
                  )}
                </span>
                {todo.due_date && (
                  <span className="todo-due-date">
                    期限: {formatDate(todo.due_date)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="todo-actions">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="edit-btn"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="delete-btn"
              >
                削除
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 