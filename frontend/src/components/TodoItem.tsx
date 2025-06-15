import React, { useState } from 'react';
import { Todo, TodoUpdate } from '../types/todo';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, updates: TodoUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  projects: string[];
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete, projects }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState<1 | 2 | 3>(todo.priority);
  const [editProject, setEditProject] = useState(todo.project);
  const [editDueDate, setEditDueDate] = useState(
    todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : ''
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
      project: editProject,
      due_date: editDueDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditProject(todo.project);
    setEditDueDate(
      todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : ''
    );
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
  };

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
                    value={editProject}
                    onChange={(e) => setEditProject(e.target.value)}
                    className="todo-select"
                  >
                    <option value="Inbox">Inbox</option>
                    {projects
                      .filter(p => p !== 'Inbox')
                      .map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-due-date">期限:</label>
                  <input
                    type="date"
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
                <span className="todo-project">プロジェクト: {todo.project}</span>
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