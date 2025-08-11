CONTAINER_NAME ?= travel-app
HOST ?= 0.0.0.0:8097

all: help

help: ## Show this help message
	@echo "Commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Local Development
build: ## Build the Docker image
	@echo "Building Docker image...$(NC)"
	docker compose build --no-cache
	@echo "Build completed successfully!$(NC)"

run: ## Run the container locally
	@echo "Starting container...$(NC)"
	docker compose up -d
	@echo "Container started! Access at http://$(HOST)$(NC)"

stop: ## Stop the running container
	@echo "Stopping container...$(NC)"
	docker compose down
	@echo "Container stopped!$(NC)"

update: build restart ## Update the container with latest changes

restart: stop run ## Restart the container

logs: ## Show container logs
	docker compose logs -f

shell: ## Access container shell
	docker exec -it $(CONTAINER_NAME) /bin/bash

backup: ## Backup database from container
	@echo "Creating database backup...$(NC)"
	docker exec $(CONTAINER_NAME) cp /var/www/html/db/app_database.sqlite /tmp/
	@echo "Database backup created!$(NC)"

check-health: ## Check application health
	@echo "Checking application health...$(NC)"
	curl -f http://$(HOST)/api/health || echo "$(RED)Health check failed!$(NC)"
