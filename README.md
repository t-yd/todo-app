# Todo アプリケーション

マルチユーザー対応のタスク管理アプリケーション

## 🚀 特徴

### 🔐 ユーザー認証・認可
- ✅ ユーザー登録・ログイン機能
- 🔒 JWT認証によるセキュアなAPI保護
- 👤 ユーザー別データ分離（自分のデータのみアクセス可能）
- 🛡️ bcryptによるパスワードハッシュ化

### 📁 プロジェクト管理
- ✅ プロジェクトの作成、編集、削除
- 🎨 プロジェクトカラー設定
- 📂 デフォルトプロジェクト（Inbox）自動作成
- 🔒 ユーザー別プロジェクト管理

### 📝 タスク管理
- ✅ タスクの作成、編集、削除
- 🔄 タスクの完了/未完了の切り替え
- 📅 期限設定機能
- 🎯 優先度設定（低・中・高）
- 🔍 プロジェクト別フィルタリング
- 📱 レスポンシブデザイン

## 🛠 技術スタック

### 利用言語
- **Python** (FastAPI, SQLAlchemy)
- **TypeScript** (React)

### データベース
- **MySQL 8.0** (開発環境)

### 認証・セキュリティ
- **JWT** (JSON Web Token)
- **bcrypt** (パスワードハッシュ化)
- **python-jose** (JWT処理)

### インフラ
- **Docker** & **Docker Compose**

## 🏗 アーキテクチャ

### 開発環境
```
Frontend (React) ←→ Backend (FastAPI + JWT Auth) ←→ MySQL
```

### データベース構造
```
users (ユーザー情報)
├── id, username, email
├── hashed_password
└── is_active, created_at, updated_at

projects (プロジェクト)
├── id, name, description, color
├── is_default, owner_id (FK)
└── created_at, updated_at

todos (タスク)
├── id, title, description
├── completed, priority, due_date
├── project_id (FK), owner_id (FK)
└── created_at, updated_at
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
```

## 📝 API エンドポイント

### 🔐 認証エンドポイント
| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/auth/register` | ユーザー登録 | 不要 |
| POST | `/auth/login` | ログイン | 不要 |
| GET | `/auth/me` | ユーザー情報取得 | 必要 |

### 📁 プロジェクトエンドポイント
| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/projects` | プロジェクト一覧取得 | 必要 |
| GET | `/projects/{id}` | プロジェクト詳細取得 | 必要 |
| POST | `/projects` | プロジェクト作成 | 必要 |
| PUT | `/projects/{id}` | プロジェクト更新 | 必要 |
| DELETE | `/projects/{id}` | プロジェクト削除 | 必要 |

### 📝 タスクエンドポイント
| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/todos` | タスク一覧取得 | 必要 |
| GET | `/todos/{id}` | タスク詳細取得 | 必要 |
| POST | `/todos` | タスク作成 | 必要 |
| PUT | `/todos/{id}` | タスク更新 | 必要 |
| DELETE | `/todos/{id}` | タスク削除 | 必要 |

### 🔧 システムエンドポイント
| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/` | ヘルスチェック | 不要 |
| GET | `/health` | データベース接続確認 | 不要 |

## 🔐 認証の使用方法

### 1. ユーザー登録
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "email": "your@email.com",
    "password": "your_password"
  }'
```

### 2. ログイン
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

レスポンス例：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "your_username",
    "email": "your@email.com",
    "is_active": true,
    "created_at": "2025-06-15T14:57:37"
  }
}
```

### 3. 認証が必要なAPI呼び出し
```bash
# プロジェクト一覧取得
curl -X GET http://localhost:8000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# タスク作成
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新しいタスク",
    "description": "タスクの説明",
    "priority": 2,
    "project_id": 1,
    "due_date": "2025-12-31T23:59:59"
  }'
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
- データベーステーブルの作成（users, projects, todos）

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

## 📁 プロジェクト構造

```
todo-app/
├── backend/                 # FastAPI バックエンド
│   ├── main.py             # メインアプリケーション
│   ├── database.py         # データベースモデル
│   ├── auth.py             # 認証機能
│   ├── init.sql           # MySQL初期化スクリプト
│   └── requirements.txt    # Python依存関係
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── types/         # TypeScript型定義
│   │   └── services/      # API通信
│   └── package.json       # Node.js依存関係
├── docker-compose.yml     # 開発環境用（MySQL）
├── .gitignore            # Git除外設定
└── env.example           # 環境変数テンプレート
```

## 🎯 使用方法

### 1. アカウント作成・ログイン
- 初回利用時はユーザー登録を行う
- ログイン後、JWTトークンが発行される
- デフォルトプロジェクト「Inbox」が自動作成される

### 2. プロジェクト管理
- 新しいプロジェクトを作成
- プロジェクト名、説明、カラーを設定
- プロジェクトの編集・削除（デフォルトプロジェクトは削除不可）

### 3. タスク管理
- プロジェクト内でタスクを作成
- タスクの詳細（タイトル、説明、優先度、期限）を設定
- タスクの完了/未完了を切り替え
- タスクの編集・削除

### 4. フィルタリング・検索
- プロジェクト別にタスクをフィルタ
- 完了済みタスクの表示/非表示を切り替え

## 🔒 セキュリティ機能

### データ分離
- 各ユーザーは自分のデータのみアクセス可能
- プロジェクトとタスクは所有者のみが操作可能
- 他のユーザーのデータは完全に隠蔽

### 認証・認可
- JWT認証による安全なAPI保護
- トークンの有効期限管理（30分）
- bcryptによる強力なパスワードハッシュ化

### API保護
- 認証が必要なエンドポイントへの不正アクセス防止
- 所有権チェックによる不正操作防止
- HTTPSベアラートークン認証

## 🧪 テスト

### API テスト例

```bash
# ヘルスチェック
curl http://localhost:8000/health

# ユーザー登録
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'

# ログイン
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# プロジェクト作成（要認証）
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "新プロジェクト", "description": "説明", "color": "#FF5722"}'
```

## 🐛 トラブルシューティング

### 認証エラーの場合
```bash
# JWTトークンの有効性を確認
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

