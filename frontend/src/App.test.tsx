import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// 基本的なレンダリングテスト
test('アプリケーションがレンダリングされる', () => {
  render(<App />);
  // ログイン画面が表示されることを確認
  const titleElement = screen.getByText(/Todo アプリケーション/i);
  expect(titleElement).toBeInTheDocument();
}); 