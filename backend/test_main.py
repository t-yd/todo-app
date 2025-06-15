import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base

# テスト用のSQLiteデータベース設定
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    # テスト用データベースのテーブルを作成
    Base.metadata.create_all(bind=engine)
    
    client = TestClient(app)
    yield client
    
    # テスト後にテーブルを削除
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def test_project():
    return {
        "name": "テストプロジェクト",
        "description": "テスト用のプロジェクトです",
        "color": "#FF5722"
    }

@pytest.fixture
def test_todo():
    return {
        "title": "テストタスク",
        "description": "テスト用のタスクです",
        "priority": 2,
        "project_id": 1
    }

class TestAuth:
    def test_register_user(self, client, test_user):
        """ユーザー登録のテスト"""
        response = client.post("/auth/register", json=test_user)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]
        assert "id" in data
        assert data["is_active"] is True

    def test_register_duplicate_username(self, client, test_user):
        """重複ユーザー名での登録エラーテスト"""
        # 最初のユーザーを登録
        client.post("/auth/register", json=test_user)
        
        # 同じユーザー名で再度登録を試行
        response = client.post("/auth/register", json=test_user)
        assert response.status_code == 400
        assert "ユーザー名が既に使用されています" in response.json()["detail"]

    def test_login_success(self, client, test_user):
        """ログイン成功のテスト"""
        # ユーザーを登録
        client.post("/auth/register", json=test_user)
        
        # ログイン
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == test_user["username"]

    def test_login_invalid_credentials(self, client, test_user):
        """無効な認証情報でのログインエラーテスト"""
        # ユーザーを登録
        client.post("/auth/register", json=test_user)
        
        # 間違ったパスワードでログイン
        login_data = {
            "username": test_user["username"],
            "password": "wrongpassword"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 401

    def test_get_current_user(self, client, test_user):
        """現在のユーザー情報取得のテスト"""
        # ユーザーを登録してログイン
        client.post("/auth/register", json=test_user)
        login_response = client.post("/auth/login", json={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # 認証ヘッダーでユーザー情報を取得
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]

class TestProjects:
    def get_auth_headers(self, client, test_user):
        """認証ヘッダーを取得するヘルパーメソッド"""
        client.post("/auth/register", json=test_user)
        login_response = client.post("/auth/login", json={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_create_project(self, client, test_user, test_project):
        """プロジェクト作成のテスト"""
        headers = self.get_auth_headers(client, test_user)
        
        response = client.post("/projects", json=test_project, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_project["name"]
        assert data["description"] == test_project["description"]
        assert data["color"] == test_project["color"]
        assert "id" in data

    def test_get_projects(self, client, test_user, test_project):
        """プロジェクト一覧取得のテスト"""
        headers = self.get_auth_headers(client, test_user)
        
        # プロジェクトを作成
        client.post("/projects", json=test_project, headers=headers)
        
        # プロジェクト一覧を取得
        response = client.get("/projects", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == test_project["name"]

    def test_update_project(self, client, test_user, test_project):
        """プロジェクト更新のテスト"""
        headers = self.get_auth_headers(client, test_user)
        
        # プロジェクトを作成
        create_response = client.post("/projects", json=test_project, headers=headers)
        project_id = create_response.json()["id"]
        
        # プロジェクトを更新
        update_data = {"name": "更新されたプロジェクト", "color": "#2196F3"}
        response = client.put(f"/projects/{project_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "更新されたプロジェクト"
        assert data["color"] == "#2196F3"

    def test_delete_project(self, client, test_user, test_project):
        """プロジェクト削除のテスト"""
        headers = self.get_auth_headers(client, test_user)
        
        # プロジェクトを作成
        create_response = client.post("/projects", json=test_project, headers=headers)
        project_id = create_response.json()["id"]
        
        # プロジェクトを削除
        response = client.delete(f"/projects/{project_id}", headers=headers)
        assert response.status_code == 200
        
        # プロジェクトが削除されたことを確認
        get_response = client.get("/projects", headers=headers)
        assert len(get_response.json()) == 0

class TestTodos:
    def get_auth_headers_and_project(self, client, test_user, test_project):
        """認証ヘッダーとプロジェクトIDを取得するヘルパーメソッド"""
        client.post("/auth/register", json=test_user)
        login_response = client.post("/auth/login", json={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # プロジェクトを作成
        project_response = client.post("/projects", json=test_project, headers=headers)
        project_id = project_response.json()["id"]
        
        return headers, project_id

    def test_create_todo(self, client, test_user, test_project, test_todo):
        """タスク作成のテスト"""
        headers, project_id = self.get_auth_headers_and_project(client, test_user, test_project)
        test_todo["project_id"] = project_id
        
        response = client.post("/todos", json=test_todo, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == test_todo["title"]
        assert data["description"] == test_todo["description"]
        assert data["priority"] == test_todo["priority"]
        assert data["project_id"] == project_id
        assert data["completed"] is False

    def test_get_todos(self, client, test_user, test_project, test_todo):
        """タスク一覧取得のテスト"""
        headers, project_id = self.get_auth_headers_and_project(client, test_user, test_project)
        test_todo["project_id"] = project_id
        
        # タスクを作成
        client.post("/todos", json=test_todo, headers=headers)
        
        # タスク一覧を取得
        response = client.get("/todos", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == test_todo["title"]

    def test_update_todo(self, client, test_user, test_project, test_todo):
        """タスク更新のテスト"""
        headers, project_id = self.get_auth_headers_and_project(client, test_user, test_project)
        test_todo["project_id"] = project_id
        
        # タスクを作成
        create_response = client.post("/todos", json=test_todo, headers=headers)
        todo_id = create_response.json()["id"]
        
        # タスクを更新
        update_data = {"title": "更新されたタスク", "completed": True}
        response = client.put(f"/todos/{todo_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "更新されたタスク"
        assert data["completed"] is True

    def test_delete_todo(self, client, test_user, test_project, test_todo):
        """タスク削除のテスト"""
        headers, project_id = self.get_auth_headers_and_project(client, test_user, test_project)
        test_todo["project_id"] = project_id
        
        # タスクを作成
        create_response = client.post("/todos", json=test_todo, headers=headers)
        todo_id = create_response.json()["id"]
        
        # タスクを削除
        response = client.delete(f"/todos/{todo_id}", headers=headers)
        assert response.status_code == 200
        
        # タスクが削除されたことを確認
        get_response = client.get("/todos", headers=headers)
        assert len(get_response.json()) == 0

    def test_filter_todos_by_project(self, client, test_user, test_project):
        """プロジェクト別タスクフィルタのテスト"""
        headers, project_id = self.get_auth_headers_and_project(client, test_user, test_project)
        
        # 2つ目のプロジェクトを作成
        project2_data = {"name": "プロジェクト2", "color": "#4CAF50"}
        project2_response = client.post("/projects", json=project2_data, headers=headers)
        project2_id = project2_response.json()["id"]
        
        # 各プロジェクトにタスクを作成
        todo1 = {"title": "タスク1", "project_id": project_id, "priority": 1}
        todo2 = {"title": "タスク2", "project_id": project2_id, "priority": 1}
        
        client.post("/todos", json=todo1, headers=headers)
        client.post("/todos", json=todo2, headers=headers)
        
        # プロジェクト1のタスクのみを取得
        response = client.get(f"/todos?project_id={project_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "タスク1"

class TestSystem:
    def test_health_check(self, client):
        """ヘルスチェックのテスト"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data

    def test_root_endpoint(self, client):
        """ルートエンドポイントのテスト"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "database_status" in data 