from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import os

# データベースとモデルをインポート
from database import TodoItem, User, Project, get_db, create_tables, test_connection
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Pydanticモデル - 認証関連
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Pydanticモデル - プロジェクト関連
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "#3B82F6"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    color: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Pydanticモデル - ToDo関連（更新）
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 1
    project_id: int
    due_date: Optional[str] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[int] = None
    project_id: Optional[int] = None
    due_date: Optional[str] = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: int
    project_id: int
    project_name: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# FastAPIアプリケーション
app = FastAPI(title="Todo API", description="認証機能付きタスク管理アプリケーション")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# アプリケーション起動時にテーブルを作成
@app.on_event("startup")
async def startup_event():
    success, message = test_connection()
    print(f"データベース接続テスト: {message}")
    
    if success:
        create_tables()
        print("データベーステーブルの初期化完了")
    else:
        print("警告: データベース接続に問題があります")

# 基本エンドポイント
@app.get("/")
async def root():
    success, message = test_connection()
    return {
        "message": "Todo API サーバーが正常に動作しています",
        "database_status": message
    }

@app.get("/health")
async def health_check():
    success, message = test_connection()
    if success:
        return {"status": "healthy", "database": message}
    else:
        raise HTTPException(status_code=503, detail=f"Database unhealthy: {message}")

# 認証エンドポイント
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # ユーザー名の重複チェック
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="ユーザー名が既に使用されています")
    
    # メールアドレスの重複チェック
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="メールアドレスが既に使用されています")
    
    # ユーザー作成
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_credentials.username).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

# プロジェクトエンドポイント
@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.owner_id == current_user.id).order_by(Project.created_at.desc()).all()
    return projects

@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    return project

@app.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_project = Project(**project.model_dump(), owner_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int, 
    project_update: ProjectUpdate, 
    current_user: User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    db_project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    db_project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}")
async def delete_project(project_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    # プロジェクトに関連するToDoも一緒に削除される（cascade設定により）
    db.delete(db_project)
    db.commit()
    return {"message": "プロジェクトが削除されました"}

# ToDoエンドポイント（更新）
@app.get("/todos", response_model=List[TodoResponse])
async def get_todos(
    project_id: Optional[int] = None,
    completed: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(TodoItem).filter(TodoItem.owner_id == current_user.id)
    
    if project_id:
        query = query.filter(TodoItem.project_id == project_id)
    if completed is not None:
        query = query.filter(TodoItem.completed == completed)
    
    todos = query.order_by(TodoItem.created_at.desc()).all()
    
    # プロジェクト名を含むレスポンスを作成
    result = []
    for todo in todos:
        project = db.query(Project).filter(Project.id == todo.project_id).first()
        todo_dict = {
            "id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "completed": todo.completed,
            "priority": todo.priority,
            "project_id": todo.project_id,
            "project_name": project.name if project else "Unknown",
            "due_date": todo.due_date,
            "created_at": todo.created_at,
            "updated_at": todo.updated_at
        }
        result.append(todo_dict)
    
    return result

@app.get("/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    todo = db.query(TodoItem).filter(TodoItem.id == todo_id, TodoItem.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo項目が見つかりません")
    
    project = db.query(Project).filter(Project.id == todo.project_id).first()
    todo_dict = {
        "id": todo.id,
        "title": todo.title,
        "description": todo.description,
        "completed": todo.completed,
        "priority": todo.priority,
        "project_id": todo.project_id,
        "project_name": project.name if project else "Unknown",
        "due_date": todo.due_date,
        "created_at": todo.created_at,
        "updated_at": todo.updated_at
    }
    return todo_dict

@app.post("/todos", response_model=TodoResponse)
async def create_todo(todo: TodoCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # プロジェクトの所有権確認
    project = db.query(Project).filter(Project.id == todo.project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=400, detail="指定されたプロジェクトが見つかりません")
    
    todo_data = todo.model_dump()
    
    # 日付文字列をdatetimeオブジェクトに変換
    if todo_data.get('due_date'):
        try:
            todo_data['due_date'] = datetime.fromisoformat(todo_data['due_date'])
        except ValueError:
            todo_data['due_date'] = None
    
    db_todo = TodoItem(**todo_data, owner_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    
    todo_dict = {
        "id": db_todo.id,
        "title": db_todo.title,
        "description": db_todo.description,
        "completed": db_todo.completed,
        "priority": db_todo.priority,
        "project_id": db_todo.project_id,
        "project_name": project.name,
        "due_date": db_todo.due_date,
        "created_at": db_todo.created_at,
        "updated_at": db_todo.updated_at
    }
    return todo_dict

@app.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int, 
    todo_update: TodoUpdate, 
    current_user: User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    db_todo = db.query(TodoItem).filter(TodoItem.id == todo_id, TodoItem.owner_id == current_user.id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo項目が見つかりません")
    
    update_data = todo_update.model_dump(exclude_unset=True)
    
    # プロジェクトIDが変更される場合の所有権確認
    if 'project_id' in update_data:
        project = db.query(Project).filter(Project.id == update_data['project_id'], Project.owner_id == current_user.id).first()
        if not project:
            raise HTTPException(status_code=400, detail="指定されたプロジェクトが見つかりません")
    
    # 日付文字列をdatetimeオブジェクトに変換
    if 'due_date' in update_data and update_data['due_date']:
        try:
            update_data['due_date'] = datetime.fromisoformat(update_data['due_date'])
        except ValueError:
            update_data['due_date'] = None
    
    for field, value in update_data.items():
        setattr(db_todo, field, value)
    
    db_todo.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_todo)
    
    project = db.query(Project).filter(Project.id == db_todo.project_id).first()
    todo_dict = {
        "id": db_todo.id,
        "title": db_todo.title,
        "description": db_todo.description,
        "completed": db_todo.completed,
        "priority": db_todo.priority,
        "project_id": db_todo.project_id,
        "project_name": project.name if project else "Unknown",
        "due_date": db_todo.due_date,
        "created_at": db_todo.created_at,
        "updated_at": db_todo.updated_at
    }
    return todo_dict

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    db_todo = db.query(TodoItem).filter(TodoItem.id == todo_id, TodoItem.owner_id == current_user.id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo項目が見つかりません")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo項目が削除されました"} 