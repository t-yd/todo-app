from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

# 新しいデータベースモジュールをインポート
from database import TodoItem, get_db, create_tables, test_connection

# Pydanticモデル
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 1
    project: str = "Inbox"
    due_date: Optional[str] = None  # 文字列として受け取る

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[int] = None
    project: Optional[str] = None
    due_date: Optional[str] = None  # 文字列として受け取る

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: int
    project: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# FastAPIアプリケーション
app = FastAPI(title="Todo API", description="タスク管理アプリケーション")

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
    # データベース接続テスト
    success, message = test_connection()
    print(f"データベース接続テスト: {message}")
    
    if success:
        # テーブル作成
        create_tables()
        print("データベーステーブルの初期化完了")
    else:
        print("警告: データベース接続に問題があります")

# API エンドポイント
@app.get("/")
async def root():
    success, message = test_connection()
    return {
        "message": "Todo API サーバーが正常に動作しています",
        "database_status": message
    }

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    success, message = test_connection()
    if success:
        return {"status": "healthy", "database": message}
    else:
        raise HTTPException(status_code=503, detail=f"Database unhealthy: {message}")

@app.get("/todos", response_model=List[TodoResponse])
async def get_todos(
    project: Optional[str] = None,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TodoItem)
    
    if project:
        query = query.filter(TodoItem.project == project)
    if completed is not None:
        query = query.filter(TodoItem.completed == completed)
    
    todos = query.order_by(TodoItem.created_at.desc()).all()
    return todos

@app.get("/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo項目が見つかりません")
    return todo

@app.post("/todos", response_model=TodoResponse)
async def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    # Pydantic v2では model_dump() を使用
    todo_data = todo.model_dump()
    
    # 日付文字列をdatetimeオブジェクトに変換
    if todo_data.get('due_date'):
        try:
            todo_data['due_date'] = datetime.fromisoformat(todo_data['due_date'])
        except ValueError:
            todo_data['due_date'] = None
    
    db_todo = TodoItem(**todo_data)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: int, todo_update: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo項目が見つかりません")
    
    # Pydantic v2では model_dump() を使用
    update_data = todo_update.model_dump(exclude_unset=True)
    
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
    return db_todo

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo項目が見つかりません")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo項目が削除されました"}

@app.get("/projects")
async def get_projects(db: Session = Depends(get_db)):
    projects = db.query(TodoItem.project).distinct().all()
    return [project[0] for project in projects] 