// ユーザー関連の型
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// プロジェクト関連の型
export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  color?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  color?: string;
}

// Todo関連の型（更新）
export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
  project_id: number;
  project_name: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  priority?: 1 | 2 | 3;
  project_id: number;
  due_date?: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 1 | 2 | 3;
  project_id?: number;
  due_date?: string;
} 