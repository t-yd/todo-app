#!/bin/bash

echo "🧪 Todo アプリケーションのテストを実行します..."
echo

# Dockerコンテナが起動しているかチェック
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Dockerコンテナが起動していません。起動中..."
    docker compose up -d
    echo "⏳ サービスの起動を待機中..."
    sleep 10
fi

echo "📋 テスト実行計画:"
echo "  1. フロントエンドテスト (React)"
echo "  2. バックエンドユニットテスト (pytest)"
echo "  3. バックエンドAPIテスト (Python)"
echo

# フロントエンドテスト
echo "🎨 フロントエンドテストを実行中..."
echo "----------------------------------------"
docker compose exec -T frontend npm test -- --watchAll=false
frontend_result=$?

echo
echo "🔬 バックエンドユニットテストを実行中..."
echo "----------------------------------------"
docker compose exec -T backend python -m pytest test_main.py -v --tb=short
pytest_result=$?

echo
echo "🔧 バックエンドAPIテストを実行中..."
echo "----------------------------------------"

# APIが利用可能になるまで待機
echo "⏳ APIサーバーの準備を待機中..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ APIサーバーが利用可能です"
        break
    fi
    echo "  待機中... ($i/30)"
    sleep 2
done

# シンプルなAPIテストを実行
docker compose exec -T backend python simple_test.py
api_result=$?

echo
echo "📊 テスト結果サマリー:"
echo "----------------------------------------"
if [ $frontend_result -eq 0 ]; then
    echo "✅ フロントエンドテスト: 成功"
else
    echo "❌ フロントエンドテスト: 失敗"
fi

if [ $pytest_result -eq 0 ]; then
    echo "✅ バックエンドユニットテスト: 成功"
else
    echo "❌ バックエンドユニットテスト: 失敗"
fi

if [ $api_result -eq 0 ]; then
    echo "✅ バックエンドAPIテスト: 成功"
else
    echo "❌ バックエンドAPIテスト: 失敗"
fi

echo
if [ $frontend_result -eq 0 ] && [ $pytest_result -eq 0 ] && [ $api_result -eq 0 ]; then
    echo "🎉 全てのテストが成功しました！"
    exit 0
else
    echo "⚠️  一部のテストが失敗しました。"
    exit 1
fi 