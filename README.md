# Todo アプリケーション

## 🚀 特徴

- ✅ タスクの作成、編集、削除
- 🔄 タスクの完了/未完了の切り替え
- 📂 プロジェクト（カテゴリ）別の管理
- 📅 期限設定機能
- 🎯 優先度設定（低・中・高）
- 🔍 フィルタリング機能
- 📱 レスポンシブデザイン

## 🛠 技術スタック

### 利用言語
- **Python** (FastAPI, SQLAlchemy)
- **TypeScript** (React)

### データベース
- **MySQL 8.0** (開発環境)

### インフラ
- **Docker** & **Docker Compose**

## 🏗 アーキテクチャ

### 開発環境
```
Frontend (React) ←→ Backend (FastAPI) ←→ MySQL
```

## 🚀 セットアップ

### 開発環境（MySQL使用）

```bash
# リポジトリをクローン
git clone <repository-url>
cd todo-app

# 開発環境で起動
docker-compose up -d

# データベース接続確認
curl http://localhost:8000/health
```

## 🔧 環境変数

`env.example`をコピーして`.env`を作成し、必要な値を設定してください。

```bash
# MySQL設定（開発環境）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=todoapp
MYSQL_USER=todoapp
MYSQL_PASSWORD=todoapp_password

# デバッグ設定（開発環境用）
SQL_DEBUG=true
```

## 📝 API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/` | ヘルスチェック |
| GET | `/health` | データベース接続確認 |
| GET | `/todos` | Todo一覧取得 |
| POST | `/todos` | Todo作成 |
| PUT | `/todos/{id}` | Todo更新 |
| DELETE | `/todos/{id}` | Todo削除 |
| GET | `/projects` | プロジェクト一覧 |

## 🧪 テスト

```bash
# バックエンドテスト
cd backend
python -m pytest tests/ -v

# フロントエンドテスト
cd frontend
npm test
```

## 📦 ビルド

```bash
# フロントエンドビルド
cd frontend
npm run build

# Dockerイメージビルド
docker-compose build
```

## 📁 プロジェクト構造

```
todo-app/
├── backend/                 # FastAPI バックエンド
│   ├── main.py             # メインアプリケーション
│   ├── database.py         # データベース設定
│   ├── init.sql           # MySQL初期化スクリプト
│   └── requirements.txt    # Python依存関係
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── types/         # TypeScript型定義
│   │   └── services/      # API通信
│   └── package.json       # Node.js依存関係
├── docker-compose.yml     # 開発環境用（MySQL）
└── env.example           # 環境変数テンプレート
```

## 📦 ローカルでの起動方法

### 前提条件
- Docker
- Docker Compose

### 1. リポジトリをクローン
```bash
git clone <repository-url>
cd todo-app
```

### 2. アプリケーションを起動
```bash
# Docker ComposeでMySQL、バックエンド、フロントエンドを同時に起動
docker-compose up --build
```

初回起動時は以下の処理が行われます：
- MySQLコンテナの起動とデータベース初期化
- 依存関係のインストールとイメージのビルド
- データベーステーブルの作成

起動には数分かかる場合があります。

### 3. アプリケーションにアクセス

起動が完了したら、以下のURLでアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **APIドキュメント（Swagger）**: http://localhost:8000/docs
- **MySQL**: localhost:3306

## 🗄️ データベース接続

### 接続設定
- **Host**: `localhost` または `127.0.0.1`
- **Port**: `3306`
- **User**: `root`
- **Password**: `root_password`
- **Database**: `todoapp`

### 代替ユーザー
- **User**: `todoapp`
- **Password**: `todoapp_password`



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

## 🐛 トラブルシューティング

### ポートが既に使用されている場合
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :8000
lsof -i :3306

# 必要に応じてプロセスを停止
```

### MySQL接続エラーの場合
```bash
# MySQLコンテナのログを確認
docker-compose logs mysql

# データベース接続をテスト
curl http://localhost:8000/health
```

### Docker関連の問題
```bash
# Dockerイメージとコンテナをクリーンアップ
docker-compose down --volumes --remove-orphans
docker system prune -f

# 再度ビルドして起動
docker-compose up --build
```

## 🤝 コントリビューション

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

