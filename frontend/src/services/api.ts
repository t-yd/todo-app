import axios from 'axios';
import { 
  Todo, 
  TodoCreate, 
  TodoUpdate, 
  User, 
  UserCreate, 
  UserLogin, 
  AuthResponse,
  Project,
  ProjectCreate,
  ProjectUpdate
} from '../types/todo';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// トークンをローカルストレージから取得してヘッダーに設定
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 認証エラー時の処理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証API
export const authApi = {
  // ユーザー登録
  register: async (userData: UserCreate): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // ログイン
  login: async (credentials: UserLogin): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    const authData = response.data;
    
    // トークンとユーザー情報をローカルストレージに保存
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    return authData;
  },

  // ログアウト
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  // 現在のユーザー情報を取得
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // ローカルストレージからユーザー情報を取得
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // トークンの存在確認
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
};

// プロジェクトAPI
export const projectApi = {
  // プロジェクト一覧を取得
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // 特定のプロジェクトを取得
  getProject: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // 新しいプロジェクトを作成
  createProject: async (project: ProjectCreate): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  // プロジェクトを更新
  updateProject: async (id: number, project: ProjectUpdate): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  // プロジェクトを削除
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// TodoAPI
export const todoApi = {
  // すべてのTodoを取得
  getTodos: async (project_id?: number, completed?: boolean): Promise<Todo[]> => {
    const params = new URLSearchParams();
    if (project_id) params.append('project_id', project_id.toString());
    if (completed !== undefined) params.append('completed', completed.toString());
    
    const response = await api.get('/todos', { params });
    return response.data;
  },

  // 特定のTodoを取得
  getTodo: async (id: number): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // 新しいTodoを作成
  createTodo: async (todo: TodoCreate): Promise<Todo> => {
    const response = await api.post('/todos', todo);
    return response.data;
  },

  // Todoを更新
  updateTodo: async (id: number, todo: TodoUpdate): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  // Todoを削除
  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
}; 