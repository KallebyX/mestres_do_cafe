# 🚀 Guia de Instalação

Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento do Café Enterprise.

## 📋 Pré-requisitos

### Obrigatórios
- **Node.js** 18.0.0 ou superior
- **Python** 3.9.0 ou superior
- **pip** (gerenciador de pacotes Python)
- **npm** 8.0.0 ou superior

### Opcionais
- **Docker** & **Docker Compose** (para ambiente containerizado)
- **Git** (para controle de versão)

## 🛠️ Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/KallebyX/cafe.git
cd cafe
```

### 2. Configuração do Ambiente

```bash
# Copie o arquivo de exemplo das variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 3. Instalação das Dependências

#### Opção A: Instalação Automática (Recomendada)
```bash
# Instala todas as dependências automaticamente
make install
```

#### Opção B: Instalação Manual
```bash
# Instalar dependências do workspace raiz
npm install

# Instalar dependências do frontend
cd apps/web
npm install
cd ../..

# Instalar dependências do backend
cd apps/api
pip install -r requirements.txt
cd ../..
```

### 4. Configuração do Banco de Dados

#### Desenvolvimento (SQLite)
```bash
# O banco SQLite será criado automaticamente na primeira execução
```

#### Produção (PostgreSQL)
```bash
# Configure as variáveis no .env:
# DATABASE_URL=postgresql://user:password@localhost:5432/cafe_db

# Execute as migrações
cd apps/api
python -m flask db upgrade
```

### 5. Executar o Projeto

#### Opção A: Ambiente Completo
```bash
# Inicia frontend e backend simultaneamente
make dev
```

#### Opção B: Serviços Separados
```bash
# Terminal 1: Frontend
make dev-web

# Terminal 2: Backend
make dev-api
```

#### Opção C: Docker (Recomendado para Produção)
```bash
# Build das imagens
make docker-build

# Subir todos os serviços
make docker-up
```

## 🌐 Acessos

Após a instalação, você pode acessar:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentação API**: http://localhost:5000/docs
- **Adminer** (Docker): http://localhost:8080
- **Redis Commander** (Docker): http://localhost:8081

## 🔧 Configurações Importantes

### Variáveis de Ambiente Essenciais

```env
# API
SECRET_KEY=sua-chave-secreta-aqui
JWT_SECRET_KEY=sua-chave-jwt-aqui
DATABASE_URL=sqlite:///mestres_cafe.db

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Café Enterprise
```

### Configuração do Email (Opcional)

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app
```

## 🧪 Verificação da Instalação

```bash
# Verificar status dos serviços
make status

# Executar testes
make test

# Verificar qualidade do código
make lint
```

## 🐛 Problemas Comuns

### Python não encontrado
```bash
# Ubuntu/Debian
sudo apt-get install python3 python3-pip

# macOS
brew install python3

# Windows
# Baixe e instale do site oficial: https://python.org
```

### Node.js não encontrado
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Baixe e instale do site oficial: https://nodejs.org
```

### Erro de Permissão (macOS/Linux)
```bash
# Alterar proprietário da pasta
sudo chown -R $USER:$USER .

# Dar permissão de execução
chmod +x scripts/*.sh
```

### Porta já em uso
```bash
# Verificar qual processo está usando a porta
lsof -i :5000
lsof -i :3000

# Encerrar processo
kill -9 <PID>
```

## 🆘 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os [Issues](https://github.com/KallebyX/cafe/issues) existentes
2. Crie um novo Issue detalhando o problema
3. Consulte o [FAQ](./faq.md)

## 📚 Próximos Passos

- [📡 Configuração da API](./configuration.md)
- [🏗️ Arquitetura do Sistema](./architecture.md)
- [🤝 Como Contribuir](./contributing.md)