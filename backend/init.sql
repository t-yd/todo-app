-- MySQL初期化スクリプト
-- 文字セットをUTF8に設定
ALTER DATABASE todoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- タイムゾーンを設定
SET time_zone = '+00:00';

-- 既存ユーザーを削除
DROP USER IF EXISTS 'todoapp'@'localhost';
DROP USER IF EXISTS 'todoapp'@'%';
DROP USER IF EXISTS 'root'@'%';

-- rootユーザーのパスワードを設定
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password';

-- rootユーザーを再作成（外部接続用）
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- todoappユーザーを作成
CREATE USER 'todoapp'@'%' IDENTIFIED WITH mysql_native_password BY 'todoapp_password';
CREATE USER 'todoapp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'todoapp_password';

-- 権限を付与
GRANT ALL PRIVILEGES ON *.* TO 'todoapp'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'todoapp'@'localhost' WITH GRANT OPTION;

-- 権限を反映
FLUSH PRIVILEGES; 