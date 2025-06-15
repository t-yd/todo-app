import React, { useState, useEffect } from 'react';
import { Todo, TodoCreate, TodoUpdate, Project, User } from './types/todo';
import { todoApi, projectApi, authApi } from './services/api';
import { TodoItem } from './components/TodoItem';
import { TodoForm } from './components/TodoForm';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';
import ProjectManager from './components/ProjectManager';
import { ProjectCreate, ProjectUpdate } from './types/todo';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 認証状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const user = await authApi.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (err) {
          // トークンが無効な場合はログアウト
          authApi.logout();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Todoリストを取得
  const fetchTodos = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const fetchedTodos = await todoApi.getTodos(
        selectedProjectId || undefined,
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
    if (!isAuthenticated) return;
    
    try {
      const fetchedProjects = await projectApi.getProjects();
      setProjects(fetchedProjects);
      
      // 初期選択は全プロジェクト表示
      if (fetchedProjects.length > 0 && selectedProjectId === null) {
        // 何も選択しない（全プロジェクト表示）
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // 新しいTodoを作成
  const handleCreateTodo = async (todoData: TodoCreate) => {
    try {
      await todoApi.createTodo(todoData);
      await fetchTodos();
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
      } catch (err) {
        setError('Todoの削除に失敗しました');
        console.error('Error deleting todo:', err);
      }
    }
  };

  // ログイン成功時の処理
  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowRegister(false);
    const user = authApi.getStoredUser();
    setCurrentUser(user);
  };

  // ログアウト処理
  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTodos([]);
    setProjects([]);
    setSelectedProjectId(null);
  };

  // 認証後のデータ読み込み
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  // プロジェクト変更時のTodo読み込み
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated, selectedProjectId, showCompleted]);

  // プロジェクト管理関数
  const handleProjectCreate = async (projectData: ProjectCreate) => {
    try {
      const newProject = await projectApi.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
      throw error;
    }
  };

  const handleProjectUpdate = async (id: number, projectData: ProjectUpdate) => {
    try {
      const updatedProject = await projectApi.updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (error) {
      console.error('プロジェクト更新エラー:', error);
      throw error;
    }
  };

  const handleProjectDelete = async (id: number) => {
    try {
      await projectApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      
      // 削除されたプロジェクトが選択されていた場合、全プロジェクト表示に切り替え
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    } catch (error) {
      console.error('プロジェクト削除エラー:', error);
      throw error;
    }
  };

  const handleProjectSelect = (projectId: number | null) => {
    setSelectedProjectId(projectId);
  };

  // 認証されていない場合はログイン/登録画面を表示
  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>📝 Todo アプリケーション</h1>
        </header>
        <div className="auth-container">
          {showRegister ? (
            <Register
              onRegister={handleLogin}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onSwitchToRegister={() => setShowRegister(true)}
            />
          )}
        </div>
      </div>
    );
  }

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo アプリケーション</h1>
        <div className="user-info">
          <span>ようこそ、{currentUser?.username}さん</span>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <ProjectManager
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleProjectCreate}
            onProjectUpdate={handleProjectUpdate}
            onProjectDelete={handleProjectDelete}
          />
          
          <div className="filters">
            <div className="filter-options">
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
            <TodoForm 
              onSubmit={handleCreateTodo} 
              projects={projects}
              defaultProjectId={selectedProjectId || undefined}
            />
          </section>

          <section className="todo-list-section">
            {selectedProjectId === null ? (
              <h3>📋 すべてのプロジェクト</h3>
            ) : (
              selectedProject && (
                <div className="project-header">
                  <h1 style={{ color: selectedProject.color }}>
                    {selectedProject.name}
                  </h1>
                  {selectedProject.description && (
                    <p className="project-description">{selectedProject.description}</p>
                  )}
                </div>
              )
            )}

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
                          projects={projects}
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
                          projects={projects}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {todos.length === 0 && (
                  <div className="empty-state">
                    {selectedProjectId === null ? (
                      <p>まだタスクがありません。新しいタスクを追加してみましょう！</p>
                    ) : selectedProject ? (
                      <>
                        <p>{selectedProject.name}にはまだタスクがありません。</p>
                        <p>上のフォームから新しいタスクを追加してください。</p>
                      </>
                    ) : (
                      <p>プロジェクトを選択してください。</p>
                    )}
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