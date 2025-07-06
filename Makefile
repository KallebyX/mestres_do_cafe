# Mestres do Café - Enterprise Makefile
# Comandos para desenvolvimento, build e deploy

.PHONY: help install dev build test lint format clean docker

# Cores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Mostra esta ajuda
	@echo "$(BLUE)Mestres do Café - Enterprise Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Instala todas as dependências
	@echo "$(YELLOW)📦 Instalando dependências...$(NC)"
	npm install
	cd apps/web && npm install
	cd apps/api && pip install -r requirements.txt
	@echo "$(GREEN)✅ Dependências instaladas!$(NC)"

dev: ## Inicia desenvolvimento (frontend + backend)
	@echo "$(YELLOW)🚀 Iniciando ambiente de desenvolvimento...$(NC)"
	npm run dev

dev-web: ## Inicia apenas o frontend
	@echo "$(YELLOW)🌐 Iniciando frontend...$(NC)"
	cd apps/web && npm run dev

dev-api: ## Inicia apenas o backend
	@echo "$(YELLOW)⚡ Iniciando backend...$(NC)"
	cd apps/api && python src/app.py

build: ## Build completo do projeto
	@echo "$(YELLOW)🔨 Fazendo build completo...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build concluído!$(NC)"

build-web: ## Build apenas do frontend
	@echo "$(YELLOW)🌐 Build do frontend...$(NC)"
	cd apps/web && npm run build

build-api: ## Build apenas do backend
	@echo "$(YELLOW)⚡ Build do backend...$(NC)"
	cd apps/api && echo "API build completed"

test: ## Executa todos os testes
	@echo "$(YELLOW)🧪 Executando testes...$(NC)"
	npm run test

test-web: ## Testes do frontend
	@echo "$(YELLOW)🌐 Testes do frontend...$(NC)"
	cd apps/web && npm run test

test-api: ## Testes do backend
	@echo "$(YELLOW)⚡ Testes do backend...$(NC)"
	cd apps/api && python -m pytest

lint: ## Executa linting em todo o código
	@echo "$(YELLOW)🔍 Executando linting...$(NC)"
	npm run lint

format: ## Formata todo o código
	@echo "$(YELLOW)✨ Formatando código...$(NC)"
	npm run format

clean: ## Limpa arquivos temporários e dependências
	@echo "$(YELLOW)🧹 Limpando projeto...$(NC)"
	npm run clean
	@echo "$(GREEN)✅ Projeto limpo!$(NC)"

setup: install ## Setup inicial completo do projeto
	@echo "$(YELLOW)⚙️  Setup inicial...$(NC)"
	cp .env.example .env
	@echo "$(GREEN)✅ Setup concluído! Configure o arquivo .env$(NC)"

docker-build: ## Build das imagens Docker
	@echo "$(YELLOW)🐳 Build das imagens Docker...$(NC)"
	docker-compose build

docker-up: ## Sobe os containers
	@echo "$(YELLOW)🐳 Subindo containers...$(NC)"
	docker-compose up -d

docker-down: ## Para os containers
	@echo "$(YELLOW)🐳 Parando containers...$(NC)"
	docker-compose down

docker-logs: ## Mostra logs dos containers
	docker-compose logs -f

deploy-staging: build ## Deploy para staging
	@echo "$(YELLOW)🚀 Deploy para staging...$(NC)"
	# Adicionar comandos de deploy para staging
	@echo "$(GREEN)✅ Deploy staging concluído!$(NC)"

deploy-prod: build ## Deploy para produção
	@echo "$(RED)🚀 Deploy para PRODUÇÃO...$(NC)"
	@read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]
	# Adicionar comandos de deploy para produção
	@echo "$(GREEN)✅ Deploy produção concluído!$(NC)"

status: ## Mostra status do projeto
	@echo "$(BLUE)📊 Status do Projeto$(NC)"
	@echo "Frontend: $(shell cd apps/web && npm list --depth=0 2>/dev/null | head -1)"
	@echo "Backend: $(shell cd apps/api && python --version 2>/dev/null)"
	@echo "Docker: $(shell docker --version 2>/dev/null || echo 'Não instalado')"

logs: ## Mostra logs do desenvolvimento
	@echo "$(YELLOW)📋 Logs do desenvolvimento...$(NC)"
	tail -f apps/api/logs/*.log 2>/dev/null || echo "Nenhum log encontrado"

# Comandos de qualidade
quality: lint test ## Executa verificações de qualidade

# Comandos de banco de dados
db-migrate: ## Executa migrações do banco
	@echo "$(YELLOW)🗄️  Executando migrações...$(NC)"
	cd apps/api && python -m flask db upgrade

db-seed: ## Popula banco com dados de exemplo
	@echo "$(YELLOW)🌱 Populando banco...$(NC)"
	cd apps/api && python scripts/seed.py

# Comandos de desenvolvimento
watch: ## Monitora mudanças nos arquivos
	@echo "$(YELLOW)👀 Monitorando mudanças...$(NC)"
	npm run dev

# Default target
.DEFAULT_GOAL := help

