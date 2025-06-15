# Todo アプリケーション

TypeScript（React）とPython（FastAPI）で構築されたモダンなタスク管理アプリケーション

## 🚀 特徴

- ✅ タスクの作成、編集、削除
- 🔄 タスクの完了/未完了の切り替え
- 📂 プロジェクト（カテゴリ）別の管理
- 📅 期限設定機能
- 🎯 優先度設定（低・中・高）
- 🔍 フィルタリング機能
- 📱 レスポンシブデザイン

## 🛠 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全な開発
- **CSS3** - モダンなスタイリング

### バックエンド
- **FastAPI** - 高パフォーマンスなPython Webフレームワーク
- **SQLAlchemy** - ORM
- **SQLite** - ローカル開発用データベース
- **Pydantic** - データバリデーション

### インフラ
- **Docker** - コンテナ化
- **Docker Compose** - 開発環境の統合管理

## 📦 ローカルでの起動方法

### 前提条件
- Docker
- Docker Compose

### 1. リポジトリをクローン
\`\`\`bash
git clone <repository-url>
cd Todo-application
\`\`\`

### 2. アプリケーションを起動
\`\`\`bash
# Docker Composeでフロントエンドとバックエンドを同時に起動
docker-compose up --build
\`\`\`

初回起動時は依存関係のインストールとイメージのビルドが行われるため、数分かかる場合があります。

### 3. アプリケーションにアクセス

起動が完了したら、以下のURLでアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **APIドキュメント（Swagger）**: http://localhost:8000/docs

### 4. 停止方法
\`\`\`bash
# アプリケーションを停止
docker-compose down
\`\`\`

## 🎯 使用方法

1. **新しいタスクを追加**
   - 「新しいタスクを追加」セクションでタスクの詳細を入力
   - タイトル、説明、優先度、プロジェクト、期限を設定可能

2. **タスクの管理**
   - チェックボックスをクリックしてタスクを完了/未完了に切り替え
   - 「編集」ボタンでタスクの内容を変更
   - 「削除」ボタンでタスクを削除

3. **フィルタリング**
   - サイドバーでプロジェクト別にフィルタ
   - 完了済みタスクの表示/非表示を切り替え

## 🏗 プロジェクト構造

\`\`\`
Todo-application/
├── docker-compose.yml      # Docker Compose設定
├── backend/               # バックエンド（FastAPI）
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py           # APIサーバーのメインファイル
└── frontend/             # フロントエンド（React + TypeScript）
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── public/
    └── src/
        ├── components/   # Reactコンポーネント
        ├── services/     # API通信
        ├── types/        # TypeScript型定義
        └── App.tsx       # メインアプリケーション
\`\`\`

## 🐛 トラブルシューティング

### ポートが既に使用されている場合
\`\`\`bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :8000

# 必要に応じてプロセスを停止
\`\`\`

### Docker関連の問題
\`\`\`bash
# Dockerイメージとコンテナをクリーンアップ
docker-compose down --volumes --remove-orphans
docker system prune -f

# 再度ビルドして起動
docker-compose up --build
\`\`\`

## 📝 開発について

このプロジェクトは開発・学習用途で作成されています。本格的な本番環境での使用を想定する場合は、以下の追加実装を検討してください：

- ユーザー認証・認可機能
- 本格的なデータベース（PostgreSQL等）への移行
- セキュリティ強化
- パフォーマンス最適化
- テストの追加

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。 