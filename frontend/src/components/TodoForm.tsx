import React, { useState } from 'react';
import { TodoCreate } from '../types/todo';

interface TodoFormProps {
  onSubmit: (todo: TodoCreate) => Promise<void>;
  projects: string[];
}

export const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, projects }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [project, setProject] = useState('Inbox');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        project,
        due_date: dueDate || undefined,
      });
      
      // フォームをリセット
      setTitle('');
      setDescription('');
      setPriority(1);
      setProject('Inbox');
      setDueDate('');
    } catch (error) {
      console.error('Todo作成エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいタスクを入力..."
          className="todo-input"
          required
        />
      </div>

      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明（オプション）"
          className="todo-textarea"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">優先度:</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            className="todo-select"
          >
            <option value={1}>低</option>
            <option value={2}>中</option>
            <option value={3}>高</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="project">プロジェクト:</label>
          <select
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
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
          <label htmlFor="dueDate">期限:</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="todo-date-input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || isSubmitting}
        className="submit-btn"
      >
        {isSubmitting ? '作成中...' : 'タスクを追加'}
      </button>
    </form>
  );
}; 