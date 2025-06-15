import React, { useState } from 'react';
import { Todo, TodoUpdate } from '../types/todo';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, updates: TodoUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

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
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
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