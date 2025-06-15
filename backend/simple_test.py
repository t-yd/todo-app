import requests
import json
import traceback
import time
import random

def test_health_endpoint():
    """ヘルスチェックエンドポイントのテスト"""
    try:
        response = requests.get("http://localhost:8000/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        print("✅ ヘルスチェックテスト成功")
        return True
    except Exception as e:
        print(f"❌ ヘルスチェックテスト失敗: {e}")
        traceback.print_exc()
        return False

def test_root_endpoint():
    """ルートエンドポイントのテスト"""
    try:
        response = requests.get("http://localhost:8000/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✅ ルートエンドポイントテスト成功")
        return True
    except Exception as e:
        print(f"❌ ルートエンドポイントテスト失敗: {e}")
        traceback.print_exc()
        return False

def test_user_registration_and_login():
    """ユーザー登録とログインのテスト"""
    try:
        # ユニークなユーザー名を生成
        timestamp = int(time.time())
        random_num = random.randint(1000, 9999)
        unique_username = f"testuser_{timestamp}_{random_num}"
        
        # ユーザー登録
        user_data = {
            "username": unique_username,
            "email": f"test_{timestamp}_{random_num}@example.com",
            "password": "testpassword123"
        }
        
        print(f"📝 ユーザー登録を試行中: {user_data['username']}")
        register_response = requests.post(
            "http://localhost:8000/auth/register",
            json=user_data
        )
        print(f"📊 登録レスポンス: {register_response.status_code}")
        if register_response.status_code != 200:
            print(f"❌ 登録エラー: {register_response.text}")
            return None
            
        register_data = register_response.json()
        assert register_data["username"] == user_data["username"]
        print("✅ ユーザー登録テスト成功")
        
        # ログイン
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        print(f"🔐 ログインを試行中: {login_data['username']}")
        login_response = requests.post(
            "http://localhost:8000/auth/login",
            json=login_data
        )
        print(f"📊 ログインレスポンス: {login_response.status_code}")
        if login_response.status_code != 200:
            print(f"❌ ログインエラー: {login_response.text}")
            return None
            
        login_result = login_response.json()
        assert "access_token" in login_result
        print("✅ ログインテスト成功")
        
        return login_result["access_token"]
    except Exception as e:
        print(f"❌ ユーザー登録・ログインテスト失敗: {e}")
        traceback.print_exc()
        return None

def test_project_operations(token):
    """プロジェクト操作のテスト"""
    if not token:
        print("❌ プロジェクトテストスキップ（認証トークンなし）")
        return None
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # プロジェクト作成
        project_data = {
            "name": "テストプロジェクト",
            "description": "テスト用のプロジェクト",
            "color": "#FF5722"
        }
        
        create_response = requests.post(
            "http://localhost:8000/projects",
            json=project_data,
            headers=headers
        )
        assert create_response.status_code == 200
        project = create_response.json()
        assert project["name"] == project_data["name"]
        print("✅ プロジェクト作成テスト成功")
        
        # プロジェクト一覧取得
        list_response = requests.get(
            "http://localhost:8000/projects",
            headers=headers
        )
        assert list_response.status_code == 200
        projects = list_response.json()
        assert len(projects) >= 1
        print("✅ プロジェクト一覧取得テスト成功")
        
        return project["id"]
    except Exception as e:
        print(f"❌ プロジェクト操作テスト失敗: {e}")
        traceback.print_exc()
        return None

def test_todo_operations(token, project_id):
    """タスク操作のテスト"""
    if not token or not project_id:
        print("❌ タスクテストスキップ（認証トークンまたはプロジェクトIDなし）")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # タスク作成
        todo_data = {
            "title": "テストタスク",
            "description": "テスト用のタスク",
            "priority": 2,
            "project_id": project_id
        }
        
        create_response = requests.post(
            "http://localhost:8000/todos",
            json=todo_data,
            headers=headers
        )
        assert create_response.status_code == 200
        todo = create_response.json()
        assert todo["title"] == todo_data["title"]
        print("✅ タスク作成テスト成功")
        
        # タスク一覧取得
        list_response = requests.get(
            "http://localhost:8000/todos",
            headers=headers
        )
        assert list_response.status_code == 200
        todos = list_response.json()
        assert len(todos) >= 1
        print("✅ タスク一覧取得テスト成功")
        
        return True
    except Exception as e:
        print(f"❌ タスク操作テスト失敗: {e}")
        traceback.print_exc()
        return False

def run_all_tests():
    """全てのテストを実行"""
    print("🧪 APIテストを開始します...")
    print()
    
    # 基本エンドポイントテスト
    health_ok = test_health_endpoint()
    root_ok = test_root_endpoint()
    
    # 認証テスト
    token = test_user_registration_and_login()
    
    # プロジェクトテスト
    project_id = test_project_operations(token)
    
    # タスクテスト
    todo_ok = test_todo_operations(token, project_id)
    
    print()
    print("📊 テスト結果:")
    print(f"  ヘルスチェック: {'✅' if health_ok else '❌'}")
    print(f"  ルートエンドポイント: {'✅' if root_ok else '❌'}")
    print(f"  ユーザー認証: {'✅' if token else '❌'}")
    print(f"  プロジェクト操作: {'✅' if project_id else '❌'}")
    print(f"  タスク操作: {'✅' if todo_ok else '❌'}")
    
    all_passed = all([health_ok, root_ok, token, project_id, todo_ok])
    print()
    if all_passed:
        print("🎉 全てのテストが成功しました！")
    else:
        print("⚠️  一部のテストが失敗しました。")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests() 