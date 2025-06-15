import React, { useState, useEffect } from 'react';
import { TodoCreate, Project } from '../types/todo';

interface TodoFormProps {
  onSubmit: (todo: TodoCreate) => Promise<void>;
  projects: Project[];
  defaultProjectId?: number;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, projects, defaultProjectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [projectId, setProjectId] = useState<number>(defaultProjectId || (projects.length > 0 ? projects[0].id : 0));
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // デフォルトプロジェクトまたはプロジェクトリストが変更された時に更新
  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (projects.length > 0 && projectId === 0) {
      setProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId || projects.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        project_id: projectId,
        due_date: dueDate || undefined,
      });
      
      // フォームをリセット
      setTitle('');
      setDescription('');
      setPriority(2);
      setDueDate('');
      // プロジェクトはデフォルトのままにする
    } catch (error) {
      console.error('Todo作成エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // プロジェクトが存在しない場合の表示
  if (projects.length === 0) {
    return (
      <div className="todo-form">
        <p className="no-projects-message">
          タスクを作成するには、まずプロジェクトを作成してください。
        </p>
      </div>
    );
  }

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
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
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
          <label htmlFor="dueDate">期限:</label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="todo-date-input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || isSubmitting || !projectId}
        className="submit-btn"
      >
        {isSubmitting ? '作成中...' : 'タスクを追加'}
      </button>
    </form>
  );
}; 