# ❓ FAQ - Perguntas Frequentes

## 🚀 Instalação e Configuração

### Como instalar o projeto?
```bash
git clone https://github.com/KallebyX/cafe.git
cd cafe
make install
cp .env.example .env
make dev
```

### Quais são os pré-requisitos?
- Node.js 18+
- Python 3.9+
- Docker (opcional)

### Como configurar o banco de dados?
Para desenvolvimento, o SQLite é configurado automaticamente. Para produção, configure o PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cafe_production
```

### Erro: "Port already in use"
```bash
# Verificar qual processo está usando a porta
lsof -i :5000
lsof -i :3000

# Encerrar o processo
kill -9 <PID>
```

## 🔧 Desenvolvimento

### Como adicionar uma nova página?
1. Crie o componente em `apps/web/src/pages/`
2. Adicione a rota no `App.jsx`
3. Importe os componentes necessários

### Como criar uma nova API endpoint?
1. Crie a rota em `apps/api/src/controllers/routes/`
2. Implemente o controlador
3. Registre a rota no `app.py`

### Como executar apenas o frontend?
```bash
make dev-web
# ou
cd apps/web && npm run dev
```

### Como executar apenas o backend?
```bash
make dev-api
# ou
cd apps/api && python src/app.py
```

## 🗄️ Banco de Dados

### Como executar migrações?
```bash
cd apps/api
python -m flask db upgrade
```

### Como criar uma nova migração?
```bash
cd apps/api
python -m flask db migrate -m "Descrição da migração"
```

### Como resetar o banco de dados?
```bash
# Para SQLite (desenvolvimento)
rm apps/api/src/instance/mestres_cafe.db

# Para PostgreSQL
dropdb cafe_production
createdb cafe_production
```

### Como popular o banco com dados de teste?
```bash
cd apps/api
python scripts/seed.py
```

## 🐳 Docker

### Como usar Docker?
```bash
# Build das imagens
make docker-build

# Subir todos os serviços
make docker-up

# Parar serviços
make docker-down
```

### Como acessar o container?
```bash
# Backend
docker exec -it cafe-api-1 /bin/bash

# Frontend
docker exec -it cafe-web-1 /bin/bash

# Banco de dados
docker exec -it cafe-db-1 psql -U postgres
```

### Como ver logs dos containers?
```bash
# Todos os logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f api
docker-compose logs -f web
```

## 🔐 Autenticação

### Como funciona a autenticação?
O sistema usa JWT tokens com refresh tokens. O token é armazenado no localStorage do navegador.

### Como fazer logout?
```javascript
// No frontend
localStorage.removeItem('token')
localStorage.removeItem('refreshToken')
```

### Token expirado, como renovar?
O sistema automaticamente tenta renovar o token usando o refresh token.

### Como criar um usuário admin?
```bash
cd apps/api
python promote_admin.py email@exemplo.com
```

## 📧 Email

### Como configurar o email?
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app
```

### Como usar App Password do Gmail?
1. Ative a verificação em duas etapas
2. Gere uma senha de app
3. Use essa senha no `MAIL_PASSWORD`

### Como testar envio de email?
```bash
# Para desenvolvimento, use MailHog
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

## 🎨 Frontend

### Como adicionar um novo componente?
1. Crie o arquivo em `apps/web/src/components/`
2. Exporte o componente
3. Importe onde necessário

### Como usar o Tailwind CSS?
```jsx
// Exemplo de uso
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Conteúdo
</div>
```

### Como adicionar ícones?
```bash
# Instalar Lucide React
cd apps/web
npm install lucide-react
```

### Como gerenciar estado global?
Use React Context ou adicione uma biblioteca como Zustand:
```bash
cd apps/web
npm install zustand
```

## 🔧 Backend

### Como adicionar uma nova dependência Python?
```bash
cd apps/api
pip install nova-dependencia
pip freeze > requirements.txt
```

### Como criar um novo modelo?
```python
# apps/api/src/models/novo_modelo.py
from models.base import db

class NovoModelo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
```

### Como adicionar validação?
```python
from marshmallow import Schema, fields, validate

class NovoModeloSchema(Schema):
    nome = fields.Str(required=True, validate=validate.Length(min=2, max=100))
```

## 📊 Performance

### Como otimizar consultas ao banco?
```python
# Use eager loading
produtos = Product.query.options(
    db.joinedload(Product.category)
).all()

# Use pagination
produtos = Product.query.paginate(page=1, per_page=20)
```

### Como implementar cache?
```python
from flask_caching import Cache

cache = Cache(app)

@cache.cached(timeout=300)  # 5 minutos
def get_produtos():
    return Product.query.all()
```

### Como monitorar performance?
```bash
# Usar ferramentas como htop, iostat
htop
iostat -x 1

# Logs de performance
tail -f logs/app.log | grep "slow"
```

## 🧪 Testes

### Como executar testes?
```bash
# Todos os testes
make test

# Apenas frontend
make test-web

# Apenas backend
make test-api
```

### Como escrever um teste?
```python
# Backend
def test_criar_produto():
    response = client.post('/api/products', json={
        'name': 'Café Especial',
        'price': 29.90
    })
    assert response.status_code == 201
```

```javascript
// Frontend
test('renders product name', () => {
  render(<ProductCard name="Café Especial" price={29.90} />)
  expect(screen.getByText('Café Especial')).toBeInTheDocument()
})
```

## 🚀 Deploy

### Como fazer deploy?
```bash
# Build
make build

# Deploy para staging
make deploy-staging

# Deploy para produção
make deploy-prod
```

### Como configurar CI/CD?
Configure os secrets no GitHub:
- `HOST`: IP do servidor
- `USERNAME`: usuário SSH
- `SSH_KEY`: chave SSH privada

### Como configurar SSL?
```bash
# Usando Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

## 🔍 Debugging

### Como debugar o backend?
```python
# Adicionar breakpoints
import pdb
pdb.set_trace()

# Ou usar logging
import logging
logging.debug("Valor da variável: %s", variavel)
```

### Como debugar o frontend?
```javascript
// Browser DevTools
console.log('Valor:', valor)
debugger;

// React DevTools
// Instalar extensão React DevTools
```

### Como ver logs detalhados?
```bash
# Backend
tail -f logs/app.log

# Frontend
# Abrir DevTools > Console

# Docker
docker-compose logs -f
```

## 📱 Mobile

### O sistema é responsivo?
Sim, usa Tailwind CSS com breakpoints responsivos:
```jsx
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>
```

### Como testar em mobile?
```bash
# Usar ngrok para expor localhost
npx ngrok http 3000
```

## 🔄 Backup

### Como fazer backup?
```bash
# Banco de dados
pg_dump cafe_production > backup.sql

# Arquivos
tar -czf backup.tar.gz uploads/
```

### Como restaurar backup?
```bash
# Banco de dados
psql cafe_production < backup.sql

# Arquivos
tar -xzf backup.tar.gz
```

## 🆘 Suporte

### Onde reportar bugs?
- [GitHub Issues](https://github.com/KallebyX/cafe/issues)
- Email: suporte@exemplo.com

### Como contribuir?
1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente e teste
4. Abra um Pull Request

### Como obter ajuda?
- Consulte a [documentação](../README.md)
- Abra um [Issue](https://github.com/KallebyX/cafe/issues)
- Entre em contato via email

---

**Não encontrou sua pergunta?** Abra um [Issue](https://github.com/KallebyX/cafe/issues) e nós adicionaremos aqui!