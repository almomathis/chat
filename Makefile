IMAGE_NAME=homepage
CONTAINER_NAME=home

banner:
	@echo "==============================================="
	@echo "  🐳 almomathis homepage Docker Makefile 🐳"
	@echo "==============================================="
	@echo " Commands: build, run, stop, deploy, clean, pull"
	@echo "==============================================="

build: banner
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .
	@echo "Build complete!"

run: banner
	@echo "Starting the container..."
	docker-compose up -d
	@echo "$Container is now running! Access it at http://localhost"

stop: banner
	@echo "Stopping the container..."
	docker-compose down
	@echo "Container stopped!"

deploy: banner
	@echo "Deploying container..."
	make build
	make run
	@echo "Deployment complete!"

pull: banner
	@echo "Pulling the latest changes from GitHub..."
	git pull origin main
	docker-compose build
	@echo "Latest changes pulled and container rebuilt!"

clean: banner
	@echo "Cleaning up containers and images..."
	docker-compose down --rmi all
	@echo "Clean-up complete! All containers and images removed."

