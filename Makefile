# Makefile para Mestres do Café Enterprise

# Variáveis
PYTHON := python3
PIP := pip3
API_DIR := apps/api
WEB_DIR := apps/web
DB_SCRIPT := scripts/db_manager.py

# Cores para output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Help
.PHONY: help
help:
	@echo "$(GREEN)Mestres do Café - Comandos Disponíveis$(NC)"
	@echo ""
	@echo "$(YELLOW)Banco de Dados:$(NC)"
	@echo "  make db-init      - Inicializar banco de dados"
	@echo "  make db-migrate   - Criar nova migração"
	@echo "  make db-upgrade   - Aplicar migrações"
	@echo "  make db-seed      - Popular banco com dados iniciais"
	@echo "  make db-reset     - Resetar banco (CUIDADO!)"
	@echo "  make db-status    - Verificar status do banco"
	@echo "  make db-backup    - Fazer backup do banco"
	@echo "  make db-admin     - Criar usuário admin"
	@echo ""
	@echo "$(YELLOW)Desenvolvimento:$(NC)"
	@echo "  make dev          - Iniciar servidor de desenvolvimento"
	@echo "  make dev-api      - Iniciar apenas API"
	@echo "  make dev-web      - Iniciar apenas frontend"
	@echo ""
	@echo "$(YELLOW)Instalação:$(NC)"
	@echo "  make install      - Instalar todas as dependências"
	@echo "  make install-api  - Instalar dependências da API"
	@echo "  make install-web  - Instalar dependências do frontend"
	@echo ""
	@echo "$(YELLOW)Testes:$(NC)"
	@echo "  make test         - Executar todos os testes"
	@echo "  make test-api     - Testar API"
	@echo "  make test-web     - Testar frontend"
	@echo ""
	@echo "$(YELLOW)Limpeza:$(NC)"
	@echo "  make clean        - Limpar arquivos temporários"
	@echo "  make clean-pyc    - Remover arquivos .pyc"
	@echo "  make clean-node   - Remover node_modules"

# ===== BANCO DE DADOS =====

.PHONY: db-init
db-init:
	@echo "$(GREEN)Inicializando banco de dados...$(NC)"
	@cd $(API_DIR)/src && $(PYTHON) -c "from app import app, db; app.app_context().push(); db.create_all(); print('✅ Banco inicializado')"

.PHONY: db-migrate
db-migrate:
	@echo "$(GREEN)Criando nova migração...$(NC)"
	@read -p "Nome da migração: " name; \
	cd $(API_DIR) && alembic revision --autogenerate -m "$$name"

.PHONY: db-upgrade
db-upgrade:
	@echo "$(GREEN)Aplicando migrações...$(NC)"
	@cd $(API_DIR) && alembic upgrade head

.PHONY: db-downgrade
db-downgrade:
	@echo "$(YELLOW)Revertendo última migração...$(NC)"
	@cd $(API_DIR) && alembic downgrade -1

.PHONY: db-seed
db-seed:
	@echo "$(GREEN)Populando banco com dados iniciais...$(NC)"
	@$(PYTHON) scripts/fix_admin.py

.PHONY: db-reset
db-reset:
	@echo "$(RED)ATENÇÃO: Isso apagará TODOS os dados!$(NC)"
	@read -p "Tem certeza? (s/N): " confirm; \
	if [ "$$confirm" = "s" ] || [ "$$confirm" = "S" ]; then \
		cd $(API_DIR)/src && $(PYTHON) -c "from app import app, db; app.app_context().push(); db.drop_all(); db.create_all(); print('✅ Banco resetado')"; \
		$(PYTHON) scripts/fix_admin.py; \
	else \
		echo "Operação cancelada."; \
	fi

.PHONY: db-status
db-status:
	@echo "$(GREEN)Verificando status do banco...$(NC)"
	@cd $(API_DIR) && alembic current
	@$(PYTHON) scripts/test_db.py

.PHONY: db-backup
db-backup:
	@echo "$(GREEN)Fazendo backup do banco...$(NC)"
	@mkdir -p database_backups
	@cp $(API_DIR)/src/mestres_cafe.db database_backups/backup_$$(date +%Y%m%d_%H%M%S).db 2>/dev/null || echo "⚠️  Banco SQLite não encontrado"

.PHONY: db-restore
db-restore:
	@echo "$(YELLOW)Restaurando backup...$(NC)"
	@read -p "Arquivo de backup: " file; \
	if [ -f "$$file" ]; then \
		cp "$$file" $(API_DIR)/src/mestres_cafe.db; \
		echo "✅ Backup restaurado"; \
	else \
		echo "❌ Arquivo não encontrado: $$file"; \
	fi

.PHONY: db-admin
db-admin:
	@echo "$(GREEN)Criando usuário administrador...$(NC)"
	@$(PYTHON) scripts/fix_admin.py

# ===== DESENVOLVIMENTO =====

.PHONY: dev
dev:
	@echo "$(GREEN)Iniciando ambiente de desenvolvimento...$(NC)"
	@make -j2 dev-api dev-web

.PHONY: dev-api
dev-api:
	@echo "$(GREEN)Iniciando API...$(NC)"
	@cd $(API_DIR) && $(PYTHON) app.py

.PHONY: dev-web
dev-web:
	@echo "$(GREEN)Iniciando frontend...$(NC)"
	@cd $(WEB_DIR) && npm run dev

# ===== INSTALAÇÃO =====

.PHONY: install
install:
	@echo "$(GREEN)Instalando todas as dependências...$(NC)"
	@make install-api
	@make install-web

.PHONY: install-api
install-api:
	@echo "$(GREEN)Instalando dependências da API...$(NC)"
	@cd $(API_DIR) && $(PIP) install -r requirements.txt

.PHONY: install-web
install-web:
	@echo "$(GREEN)Instalando dependências do frontend...$(NC)"
	@cd $(WEB_DIR) && npm install

# ===== TESTES =====

.PHONY: test
test:
	@echo "$(GREEN)Executando todos os testes...$(NC)"
	@make test-api
	@make test-web

.PHONY: test-api
test-api:
	@echo "$(GREEN)Testando API...$(NC)"
	@cd $(API_DIR) && pytest

.PHONY: test-web
test-web:
	@echo "$(GREEN)Testando frontend...$(NC)"
	@cd $(WEB_DIR) && npm test

# ===== LIMPEZA =====

.PHONY: clean
clean: clean-pyc clean-node
	@echo "$(GREEN)Limpeza completa!$(NC)"

.PHONY: clean-pyc
clean-pyc:
	@echo "$(YELLOW)Removendo arquivos Python temporários...$(NC)"
	@find . -type f -name '*.pyc' -delete
	@find . -type d -name '__pycache__' -delete
	@find . -type d -name '.pytest_cache' -delete

.PHONY: clean-node
clean-node:
	@echo "$(YELLOW)Removendo node_modules...$(NC)"
	@rm -rf $(WEB_DIR)/node_modules
	@rm -rf node_modules

# ===== PRODUÇÃO =====

.PHONY: build
build:
	@echo "$(GREEN)Compilando para produção...$(NC)"
	@cd $(WEB_DIR) && npm run build

.PHONY: start
start:
	@echo "$(GREEN)Iniciando em modo produção...$(NC)"
	@cd $(API_DIR) && gunicorn app:app

# ===== QUALIDADE DE CÓDIGO =====

.PHONY: lint
lint:
	@echo "$(GREEN)Verificando qualidade do código...$(NC)"
	@cd $(API_DIR) && flake8 src/
	@cd $(WEB_DIR) && npm run lint

.PHONY: format
format:
	@echo "$(GREEN)Formatando código...$(NC)"
	@cd $(API_DIR) && black src/
	@cd $(WEB_DIR) && npm run format

# Atalho para desenvolvimento rápido
.PHONY: setup
setup: install db-init db-seed
	@echo "$(GREEN)Ambiente configurado e pronto!$(NC)"

.DEFAULT_GOAL := help
