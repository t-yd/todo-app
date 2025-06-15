# Todo アプリケーション

JWT認証を使用したマルチユーザー対応のタスク管理アプリケーション

## 🚀 特徴

### 🔐 ユーザー認証・認可
- ✅ ユーザー登録・ログイン機能
- 🔒 JWT認証によるセキュアなAPI保護
- 👤 ユーザー別データ分離（自分のデータのみアクセス可能）
- 🛡️ bcryptによるパスワードハッシュ化

### 📁 プロジェクト管理
- ✅ プロジェクトの作成、編集、削除
- 🎨 プロジェクトカラー設定（16色のプリセット）
- 📂 全プロジェクト表示機能
- 🔒 ユーザー別プロジェクト管理

### 📝 タスク管理
- ✅ タスクの作成、編集、削除
- 🔄 タスクの完了/未完了の切り替え
- 📅 期限設定機能
- 🎯 優先度設定（低・中・高）
- 🔍 プロジェクト別フィルタリング
- 📱 レスポンシブデザイン

## 🛠 技術スタック

### バックエンド
- **Python 3.11**
- **FastAPI** - 高性能なWeb API フレームワーク
- **SQLAlchemy** - ORM
- **MySQL 8.0** - データベース
- **JWT** - 認証
- **bcrypt** - パスワードハッシュ化

### フロントエンド
- **TypeScript**
- **React 18**
- **CSS3** - モダンなUI/UXデザイン

### インフラ
- **Docker** & **Docker Compose**

## 🏗 アーキテクチャ

```
Frontend (React + TypeScript) ←→ Backend (FastAPI + JWT) ←→ MySQL
```

### データベース構造
```
users (ユーザー情報)
├── id, username, email
├── hashed_password
└── is_active, created_at, updated_at

projects (プロジェクト)
├── id, name, description, color
├── owner_id (FK)
└── created_at, updated_at

todos (タスク)
├── id, title, description
├── completed, priority, due_date
├── project_id (FK), owner_id (FK)
└── created_at, updated_at
```

## 🚀 クイックスタート

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
docker-compose up -d
```

### 3. アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

### 4. 動作確認
```bash
# バックエンドの動作確認
curl http://localhost:8000/health

# レスポンス例
{"status":"healthy","database":"データベース接続成功"}
```

## 📖 使用方法

### 1. ユーザー登録・ログイン
1. http://localhost:3000 にアクセス
2. 「新規登録」をクリック
3. ユーザー名、メールアドレス、パスワードを入力
4. 登録後、自動的にログイン

### 2. プロジェクト管理
1. サイドバーの「追加」ボタンでプロジェクトを作成
2. プロジェクト名、説明、カラーを設定
3. 「編集」「削除」ボタンで管理
4. 「すべてのプロジェクト」で全タスクを表示

### 3. タスク管理
1. 「新しいタスクを追加」フォームでタスクを作成
2. タイトル、説明、優先度、期限を設定
3. チェックボックスで完了/未完了を切り替え
4. 「編集」「削除」ボタンで管理

## 📝 API ドキュメント

FastAPIが自動生成するSwagger UIドキュメントで、すべてのエンドポイントの詳細仕様を確認できます：

**API ドキュメント**: http://localhost:8000/docs

### 主要エンドポイント

#### 認証
- `POST /auth/register` - ユーザー登録
- `POST /auth/login` - ログイン
- `GET /auth/me` - ユーザー情報取得

#### プロジェクト
- `GET /projects` - プロジェクト一覧
- `POST /projects` - プロジェクト作成
- `PUT /projects/{id}` - プロジェクト更新
- `DELETE /projects/{id}` - プロジェクト削除

#### タスク
- `GET /todos` - タスク一覧（フィルタ対応）
- `POST /todos` - タスク作成
- `PUT /todos/{id}` - タスク更新
- `DELETE /todos/{id}` - タスク削除

## 🔧 開発

### 環境変数
`env.example`をコピーして`.env`を作成：

```bash
cp env.example .env
```

### ローカル開発
```bash
# 開発モードで起動（ホットリロード有効）
docker-compose up -d

# ログを確認
docker-compose logs -f

# コンテナに入る
docker-compose exec backend bash
docker-compose exec frontend bash
```

### データベース操作
```bash
# MySQLに接続
docker-compose exec mysql mysql -u todoapp -ptodoapp_password todoapp

# ユーザー一覧確認
SELECT id, username, email, created_at FROM users;
```

## 🧪 テスト

### API テスト例
```bash
# ユーザー登録
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# ログイン
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

## 📁 プロジェクト構造

```
todo-app/
├── backend/                 # FastAPI バックエンド
│   ├── main.py             # メインアプリケーション
│   ├── database.py         # データベース設定・モデル
│   ├── auth.py             # 認証機能
│   ├── requirements.txt    # Python依存関係
│   ├── Dockerfile          # バックエンドDockerfile
│   └── init.sql           # データベース初期化SQL
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── services/       # API通信
│   │   ├── types/          # TypeScript型定義
│   │   ├── App.tsx         # メインアプリケーション
│   │   └── App.css         # スタイル
│   ├── package.json        # Node.js依存関係
│   └── Dockerfile          # フロントエンドDockerfile
├── docker-compose.yml      # Docker Compose設定
├── .gitignore             # Git除外設定
├── env.example            # 環境変数テンプレート
└── README.md              # このファイル
```

## 🔒 セキュリティ

- JWT認証による安全なAPI保護
- bcryptによるパスワードハッシュ化
- ユーザー別データ分離
- CORS設定による適切なオリジン制御
- SQLインジェクション対策（SQLAlchemy ORM使用）

## 🚀 本番環境デプロイ

本番環境では以下の設定を推奨：

1. **環境変数の設定**
   - 強力なJWT秘密鍵
   - 安全なデータベースパスワード

2. **HTTPS の使用**
   - SSL/TLS証明書の設定
   - セキュアなCookie設定

3. **データベース**
   - 本番用MySQLサーバー
   - 定期バックアップ

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesページで報告してください。

