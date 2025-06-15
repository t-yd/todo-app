from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# 環境変数からMySQL設定を取得
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # MySQL用のデフォルト設定
    MYSQL_USER = os.getenv("MYSQL_USER", "todoapp")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "todoapp_password")
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "todoapp")
    
    DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# MySQL用のエンジン設定
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=os.getenv("SQL_DEBUG", "true").lower() == "true"
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# データベースモデル
class TodoItem(Base):
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(Integer, default=1, nullable=False)  # 1: Low, 2: Medium, 3: High
    project = Column(String(100), default="Inbox", nullable=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# データベースセッション取得関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# テーブル作成関数
def create_tables():
    """データベーステーブルを作成"""
    Base.metadata.create_all(bind=engine)

# データベース接続テスト関数
def test_connection():
    """データベース接続をテスト"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True, "データベース接続成功: MYSQL"
    except Exception as e:
        return False, f"データベース接続失敗: {str(e)}" 