# Todo アプリケーション

マルチユーザー対応のモダンなTodoアプリケーションです。FastAPI（Python）とReact（TypeScript）で構築されており、JWT認証とプロジェクト管理機能を提供します。

## 🚀 機能

- **ユーザー認証**: JWT認証によるセキュアなログイン・登録システム
- **プロジェクト管理**: カラー付きプロジェクトの作成、編集、削除
- **タスク管理**: プロジェクト別のタスク管理（作成、編集、削除、完了状態の切り替え）
- **フィルタリング**: プロジェクト別表示、完了済みタスクの表示/非表示
- **レスポンシブデザイン**: モバイルフレンドリーなUI

## 🛠️ 技術スタック

### バックエンド
- **FastAPI**: 高性能なPython Webフレームワーク
- **SQLAlchemy**: ORM（Object-Relational Mapping）
- **MySQL**: データベース
- **JWT**: 認証トークン
- **bcrypt**: パスワードハッシュ化

### フロントエンド
- **React**: UIライブラリ
- **TypeScript**: 型安全なJavaScript
- **Axios**: HTTP クライアント
- **CSS3**: スタイリング

### インフラ
- **Docker**: コンテナ化
- **Docker Compose**: マルチコンテナ管理

## 📁 プロジェクト構造

```
todo-app/
├── backend/                 # FastAPI バックエンド
│   ├── main.py             # メインアプリケーション
│   ├── database.py         # データベース設定とモデル
│   ├── auth.py             # 認証機能
│   ├── requirements.txt    # Python依存関係
│   ├── test_main.py        # ユニットテスト
│   ├── simple_test.py      # APIテスト
│   └── pytest.ini         # pytest設定
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── App.tsx         # メインアプリケーション
│   │   ├── components/     # Reactコンポーネント
│   │   ├── services/       # API サービス
│   │   ├── types/          # TypeScript型定義
│   │   └── App.test.tsx    # テストファイル
│   ├── package.json        # Node.js依存関係
│   └── public/             # 静的ファイル
├── docker-compose.yml      # Docker Compose設定
├── run_tests.sh           # テスト実行スクリプト
└── README.md              # このファイル
```

## 🚀 セットアップと実行

### 前提条件
- Docker
- Docker Compose

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd todo-app
```

### 2. アプリケーションの起動
```bash
docker-compose up -d
```

### 3. アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

## 🧪 テスト

### 全テストの実行
```bash
./run_tests.sh
```

### 個別テストの実行

#### フロントエンドテスト
```bash
docker-compose exec frontend npm test
```

#### バックエンドユニットテスト（pytest）
```bash
docker-compose exec backend python -m pytest test_main.py -v
```

#### バックエンドAPIテスト
```bash
docker-compose exec backend python simple_test.py
```

### テスト内容
- **フロントエンド**: Reactコンポーネントのレンダリングテスト（1件）
- **バックエンドユニットテスト**: pytestベースの包括的なテスト（16件）
  - 認証機能（ユーザー登録、ログイン、認証情報取得）
  - プロジェクト管理（CRUD操作）
  - タスク管理（CRUD操作、フィルタリング）
  - システムエンドポイント（ヘルスチェック、ルート）
- **バックエンドAPIテスト**: エンドポイントの統合テスト（8件）
  - ヘルスチェック
  - ユーザー認証（登録・ログイン）
  - プロジェクト管理（作成・一覧取得）
  - タスク管理（作成・一覧取得）

## 📊 API エンドポイント

### 認証
- `POST /auth/register` - ユーザー登録
- `POST /auth/login` - ログイン
- `GET /auth/me` - 現在のユーザー情報取得

### プロジェクト
- `GET /projects` - プロジェクト一覧取得
- `POST /projects` - プロジェクト作成
- `PUT /projects/{id}` - プロジェクト更新
- `DELETE /projects/{id}` - プロジェクト削除

### タスク
- `GET /todos` - タスク一覧取得
- `POST /todos` - タスク作成
- `PUT /todos/{id}` - タスク更新
- `DELETE /todos/{id}` - タスク削除

### システム
- `GET /` - ルートエンドポイント
- `GET /health` - ヘルスチェック

詳細なAPI仕様は http://localhost:8000/docs で確認できます。

## 🔧 開発

### 開発環境での起動
```bash
# 開発モードで起動（ホットリロード有効）
docker-compose up
```

### ログの確認
```bash
# 全サービスのログ
docker-compose logs -f

# 特定サービスのログ
docker-compose logs -f backend
docker-compose logs -f frontend
```

### データベースの初期化
```bash
# コンテナとボリュームを削除して完全にリセット
docker-compose down -v
docker-compose up -d
```

## 🛡️ セキュリティ

- JWT認証による安全なユーザー認証
- bcryptによるパスワードハッシュ化
- ユーザー別データ分離
- CORS設定による適切なアクセス制御

## 📝 使用方法

1. **ユーザー登録**: 新規アカウントを作成
2. **ログイン**: 認証情報でログイン
3. **プロジェクト作成**: 「追加」ボタンでプロジェクトを作成
4. **タスク管理**: プロジェクト内でタスクを作成・管理
5. **フィルタリング**: プロジェクト別や完了状態でタスクを絞り込み

## 🤝 コントリビューション

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

