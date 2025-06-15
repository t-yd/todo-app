import React, { useState, useEffect } from 'react';
import { Todo, TodoCreate, TodoUpdate } from './types/todo';
import { todoApi } from './services/api';
import { TodoItem } from './components/TodoItem';
import { TodoForm } from './components/TodoForm';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<string[]>(['Inbox']);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Todoリストを取得
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const fetchedTodos = await todoApi.getTodos(
        selectedProject || undefined,
        showCompleted ? undefined : false
      );
      setTodos(fetchedTodos);
    } catch (err) {
      setError('Todoの取得に失敗しました');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // プロジェクトリストを取得
  const fetchProjects = async () => {
    try {
      const fetchedProjects = await todoApi.getProjects();
      setProjects(['Inbox', ...fetchedProjects.filter(p => p !== 'Inbox')]);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // 新しいTodoを作成
  const handleCreateTodo = async (todoData: TodoCreate) => {
    try {
      await todoApi.createTodo(todoData);
      await fetchTodos();
      await fetchProjects();
    } catch (err) {
      setError('Todoの作成に失敗しました');
      console.error('Error creating todo:', err);
    }
  };

  // Todoを更新
  const handleUpdateTodo = async (id: number, updates: TodoUpdate) => {
    try {
      await todoApi.updateTodo(id, updates);
      await fetchTodos();
    } catch (err) {
      setError('Todoの更新に失敗しました');
      console.error('Error updating todo:', err);
    }
  };

  // Todoを削除
  const handleDeleteTodo = async (id: number) => {
    if (window.confirm('このタスクを削除しますか？')) {
      try {
        await todoApi.deleteTodo(id);
        await fetchTodos();
        await fetchProjects();
      } catch (err) {
        setError('Todoの削除に失敗しました');
        console.error('Error deleting todo:', err);
      }
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    fetchTodos();
    fetchProjects();
  }, [selectedProject, showCompleted]);

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo アプリケーション</h1>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <div className="filters">
            <h3>フィルター</h3>
            <div className="filter-group">
              <label htmlFor="project-filter">プロジェクト:</label>
              <select
                id="project-filter"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="filter-select"
              >
                <option value="">すべて</option>
                {projects.map(project => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                />
                完了済みを表示
              </label>
            </div>
          </div>
        </aside>

        <main className="main-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          <section className="todo-form-section">
            <h2>新しいタスクを追加</h2>
            <TodoForm onSubmit={handleCreateTodo} projects={projects} />
          </section>

          <section className="todo-list-section">
            {loading ? (
              <div className="loading">読み込み中...</div>
            ) : (
              <>
                {activeTodos.length > 0 && (
                  <div className="todo-group">
                    <h3>🔵 アクティブなタスク ({activeTodos.length})</h3>
                    <div className="todo-list">
                      {activeTodos.map(todo => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onUpdate={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {showCompleted && completedTodos.length > 0 && (
                  <div className="todo-group">
                    <h3>✅ 完了済みタスク ({completedTodos.length})</h3>
                    <div className="todo-list">
                      {completedTodos.map(todo => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onUpdate={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {todos.length === 0 && (
                  <div className="empty-state">
                    <p>まだタスクがありません。</p>
                    <p>上のフォームから新しいタスクを追加してください。</p>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App; 