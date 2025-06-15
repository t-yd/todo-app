// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// APIモックの設定
const mockAuthApi = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  isAuthenticated: jest.fn(),
  getStoredUser: jest.fn(),
  getToken: jest.fn()
};

const mockProjectApi = {
  getProjects: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn()
};

const mockTodoApi = {
  getTodos: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn()
};

// モジュールモック
jest.mock('./services/api', () => ({
  authApi: mockAuthApi,
  projectApi: mockProjectApi,
  todoApi: mockTodoApi
}));

// グローバルなテストユーティリティ
(global as any).mockAuthApi = mockAuthApi;
(global as any).mockProjectApi = mockProjectApi;
(global as any).mockTodoApi = mockTodoApi; 