#!/usr/bin/env python3
"""
Gerenciador Simplificado de Banco de Dados - Mestres do Café
"""

import os
import sys
from pathlib import Path

# Configurar paths antes de qualquer import
project_root = Path(__file__).parent.parent
api_path = project_root / 'apps' / 'api'
src_path = api_path / 'src'

# Adicionar ao PYTHONPATH
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(api_path))
sys.path.insert(0, str(src_path))

# Configurar variáveis de ambiente
os.environ['FLASK_APP'] = 'app:app'
os.environ['FLASK_ENV'] = 'development'

# Mudar para o diretório da API
os.chdir(str(api_path))

import click
from datetime import datetime
import shutil

# Agora importar a aplicação Flask
try:
    # Tentar importar usando o módulo completo
    import sys
    sys.path.append(str(src_path))
    
    # Importar app sem usar imports relativos
    import app as app_module
    app = app_module.app
    db = app_module.db
    
    # Importar modelos
    from models.user import User
    from models.products import Product, Category
    from models.orders import Order
    from werkzeug.security import generate_password_hash
    
except Exception as e:
    print(f"❌ Erro ao importar módulos: {e}")
    print(f"📍 Working directory: {os.getcwd()}")
    print(f"📍 Python path: {sys.path}")
    sys.exit(1)


@click.group()
def cli():
    """Gerenciador de Banco de Dados"""
    pass


@cli.command()
def status():
    """Verificar status do banco de dados"""
    with app.app_context():
        try:
            # Testar conexão
            db.session.execute(db.text("SELECT 1"))
            click.echo("✅ Conexão com banco OK")
            
            # Contar registros
            users = User.query.count()
            products = Product.query.count()
            categories = Category.query.count()
            orders = Order.query.count()
            
            click.echo("\n📊 Estatísticas:")
            click.echo(f"   - Usuários: {users}")
            click.echo(f"   - Produtos: {products}")
            click.echo(f"   - Categorias: {categories}")
            click.echo(f"   - Pedidos: {orders}")
            
            # Verificar admin
            admin = User.query.filter_by(is_admin=True).first()
            if admin:
                click.echo(f"\n👤 Admin: {admin.email}")
            else:
                click.echo("\n⚠️  Nenhum admin encontrado")
                
        except Exception as e:
            click.echo(f"❌ Erro ao verificar banco: {e}")


@cli.command()
def init():
    """Inicializar banco de dados"""
    with app.app_context():
        db.create_all()
        click.echo("✅ Banco de dados inicializado")


@cli.command()
def seed():
    """Popular banco com dados iniciais"""
    with app.app_context():
        # Verificar se já existe dados
        if User.query.filter_by(email='admin@mestrescafe.com').first():
            click.echo("⚠️  Dados já existem. Use 'reset' para limpar.")
            return
            
        try:
            # Criar usuário admin
            admin = User(
                email='admin@mestrescafe.com',
                name='Administrador',
                password_hash=generate_password_hash('admin123'),
                is_admin=True,
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            
            # Criar categorias
            cat1 = Category(
                name='Cafés Especiais',
                slug='cafes-especiais',
                description='Cafés de alta qualidade'
            )
            cat2 = Category(
                name='Cafés Gourmet',
                slug='cafes-gourmet',
                description='Blends exclusivos'
            )
            cat3 = Category(
                name='Acessórios',
                slug='acessorios',
                description='Equipamentos para café'
            )
            
            db.session.add(cat1)
            db.session.add(cat2)
            db.session.add(cat3)
            db.session.commit()
            
            # Criar produtos
            prod1 = Product(
                name='Café Premium Arábica',
                slug='cafe-premium-arabica',
                description='Café especial do Cerrado',
                price=29.90,
                category_id=cat1.id,
                is_active=True,
                stock_quantity=100
            )
            
            prod2 = Product(
                name='Café Gourmet Robusta',
                slug='cafe-gourmet-robusta',
                description='Blend exclusivo',
                price=24.90,
                category_id=cat2.id,
                is_active=True,
                stock_quantity=150
            )
            
            db.session.add(prod1)
            db.session.add(prod2)
            db.session.commit()
            
            click.echo("✅ Dados iniciais criados com sucesso!")
            click.echo("   - Admin: admin@mestrescafe.com / admin123")
            click.echo("   - 3 categorias")
            click.echo("   - 2 produtos")
            
        except Exception as e:
            db.session.rollback()
            click.echo(f"❌ Erro ao criar dados: {e}")
            import traceback
            traceback.print_exc()


@cli.command()
@click.option('--confirm', is_flag=True, help='Confirmar reset')
def reset(confirm):
    """Resetar banco de dados"""
    if not confirm:
        click.echo("⚠️  Use --confirm para confirmar o reset")
        return
        
    with app.app_context():
        click.echo("🗑️  Removendo tabelas...")
        db.drop_all()
        click.echo("✅ Tabelas removidas")
        
        click.echo("🔧 Recriando tabelas...")
        db.create_all()
        click.echo("✅ Tabelas recriadas")


if __name__ == '__main__':
    cli()