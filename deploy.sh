#!/bin/bash

echo "🚀 开始部署项目..."

echo "停止现有服务..."
docker-compose down

echo "构建并启动服务..."
docker-compose up -d --build

echo "等待服务启动..."
sleep 20

echo "运行数据库迁移..."
docker-compose exec -T app npx prisma migrate deploy

echo "检查服务状态..."
docker-compose ps

echo "✅ 部署完成！"
echo "应用地址: http://localhost:3100"