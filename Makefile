.PHONY: banner build start stop restart logs clean help deploy pull

banner:
	@echo "==============================================="
	@echo "   🐳 Chat Application Deployment 🐳"
	@echo "==============================================="
	@echo " Commands: build, start, stop, restart, logs, clean, deploy, pull"
	@echo "==============================================="

build: banner
	@echo "🔨 Building Docker images..."
	docker-compose build
	@echo "✅ Build complete!"

start: banner
	@echo "🚀 Starting containers..."
	docker-compose up -d
	@echo "✅ Containers are now running!"
	@echo "🌐 Services available at:"
	@echo "   - Chat App: http://localhost:$(shell grep PORT .env | cut -d= -f2 || echo 8443)"
	@echo "   - Web: http://localhost"
	@echo "   - Portainer: http://localhost:9000"

stop: banner
	@echo "🛑 Stopping containers..."
	docker-compose down
	@echo "✅ Containers stopped!"

restart: stop start

logs:
	@echo "📋 Showing logs..."
	docker-compose logs -f

clean: banner
	@echo "🧹 Cleaning up containers, images, volumes..."
	docker-compose down --rmi all -v
	@echo "✅ Clean-up complete!"

deploy: banner
	@echo "🚀 Deploying containers..."
	git pull origin main
	docker-compose build
	docker-compose up -d
	@echo "✅ Deployment complete!"

pull: banner
	@echo "⬇️ Pulling latest changes..."
	git pull origin main
	@echo "✅ Latest changes pulled!"

help: banner
	@echo "Available commands:"
	@echo "  make build    - Build all Docker images"
	@echo "  make start    - Start all containers"
	@echo "  make stop     - Stop all containers"
	@echo "  make restart  - Restart all containers"
	@echo "  make logs     - Show logs from all containers"
	@echo "  make clean    - Remove all containers, images, and volumes"
	@echo "  make deploy   - Pull latest changes and deploy"
	@echo "  make pull     - Pull latest changes from git repository"
