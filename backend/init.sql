-- MySQL初期化スクリプト
-- 文字セットをUTF8に設定
ALTER DATABASE todoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- タイムゾーンを設定
SET time_zone = '+00:00';

-- 既存ユーザーを削除
DROP USER IF EXISTS 'todoapp'@'localhost';
DROP USER IF EXISTS 'todoapp'@'127.0.0.1';
DROP USER IF EXISTS 'todoapp'@'%';
DROP USER IF EXISTS 'root'@'%';

-- rootユーザーを再作成（外部接続用）
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- todoappユーザーを作成
CREATE USER 'todoapp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'todoapp_password';
CREATE USER 'todoapp'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'todoapp_password';
CREATE USER 'todoapp'@'%' IDENTIFIED WITH mysql_native_password BY 'todoapp_password';

-- 権限を付与
GRANT ALL PRIVILEGES ON todoapp.* TO 'todoapp'@'localhost';
GRANT ALL PRIVILEGES ON todoapp.* TO 'todoapp'@'127.0.0.1';
GRANT ALL PRIVILEGES ON todoapp.* TO 'todoapp'@'%';

-- 権限を反映
FLUSH PRIVILEGES;

-- 接続テスト用のテーブルを作成
CREATE TABLE IF NOT EXISTS connection_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テストデータを挿入
INSERT INTO connection_test (message) VALUES ('接続テスト成功');

-- 作成されたユーザーを確認
SELECT user, host, plugin FROM mysql.user WHERE user IN ('root', 'todoapp') ORDER BY user, host; 