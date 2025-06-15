import axios from 'axios';
import { Todo, TodoCreate, TodoUpdate } from '../types/todo';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  // すべてのTodoを取得
  getTodos: async (project?: string, completed?: boolean): Promise<Todo[]> => {
    const params = new URLSearchParams();
    if (project) params.append('project', project);
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

  // プロジェクト一覧を取得
  getProjects: async (): Promise<string[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
}; 