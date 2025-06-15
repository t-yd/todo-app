export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
  project: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  priority?: 1 | 2 | 3;
  project?: string;
  due_date?: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 1 | 2 | 3;
  project?: string;
  due_date?: string;
} 