#!/usr/bin/env python3
"""
Gerenciador de Banco de Dados - Mestres do Café
Script para operações de banco de dados
"""

import os
import sys
import click
from pathlib import Path
from datetime import datetime
import shutil

# Configurar ambiente Flask
os.environ['FLASK_APP'] = 'apps.api.src.app:app'
os.environ['FLASK_ENV'] = os.environ.get('FLASK_ENV', 'development')

# Adicionar diretórios ao path
current_dir = Path(__file__).parent.parent
sys.path.insert(0, str(current_dir))

# Importar Flask app
try:
    from apps.api.src.app import app, db
    from apps.api.src.models.user import User
    from apps.api.src.models.products import Product, Category
    from apps.api.src.models.orders import Order
    from werkzeug.security import generate_password_hash
except ImportError:
    # Fallback: tentar importação alternativa
    api_dir = current_dir / 'apps' / 'api'
    src_dir = api_dir / 'src'
    sys.path.insert(0, str(src_dir))
    
    from app import app, db  # type: ignore
    from models.user import User  # type: ignore
    from models.products import Product, Category  # type: ignore
    from models.orders import Order  # type: ignore
    from werkzeug.security import generate_password_hash


@click.group()
def cli():
    """Gerenciador de Banco de Dados"""
    pass


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
            
        # Criar usuário admin
        admin = User(
            email='admin@mestrescafe.com',
            name='Administrador',
            password_hash=generate_password_hash('admin123'),
            is_admin=True,
            is_active=True
        )
        
        # Criar categorias
        categorias = [
            Category(
                name='Cafés Especiais',
                slug='cafes-especiais',
                description='Cafés de alta qualidade e origem única'
            ),
            Category(
                name='Cafés Gourmet',
                slug='cafes-gourmet',
                description='Blends exclusivos e premiados'
            ),
            Category(
                name='Acessórios',
                slug='acessorios',
                description='Equipamentos e acessórios para café'
            )
        ]
        
        # Criar produtos exemplo
        produtos = [
            Product(
                name='Café Premium Arábica',
                slug='cafe-premium-arabica',
                description='Café especial da região do Cerrado Mineiro',
                price=29.90,
                category=categorias[0],
                is_active=True,
                stock_quantity=100,
                roast_level='Medium',
                origin='Brasil - Cerrado Mineiro',
                tasting_notes='Chocolate, Caramelo, Nozes'
            ),
            Product(
                name='Café Gourmet Robusta',
                slug='cafe-gourmet-robusta',
                description='Blend exclusivo com grãos selecionados',
                price=24.90,
                category=categorias[1],
                is_active=True,
                stock_quantity=150,
                roast_level='Dark',
                origin='Brasil - Sul de Minas',
                tasting_notes='Cacau, Especiarias, Corpo Intenso'
            ),
            Product(
                name='Moedor Manual Premium',
                slug='moedor-manual-premium',
                description='Moedor manual com mós de cerâmica',
                price=89.90,
                category=categorias[2],
                is_active=True,
                stock_quantity=50
            )
        ]
        
        # Salvar todos os dados
        db.session.add(admin)
        for cat in categorias:
            db.session.add(cat)
        db.session.commit()  # Commit categorias primeiro
        
        for prod in produtos:
            db.session.add(prod)
        db.session.commit()
        
        click.echo("✅ Dados iniciais criados com sucesso!")
        click.echo("   - Admin: admin@mestrescafe.com / admin123")
        click.echo(f"   - {len(categorias)} categorias")
        click.echo(f"   - {len(produtos)} produtos")


@cli.command()
@click.option('--confirm', is_flag=True, help='Confirmar reset do banco')
def reset(confirm):
    """Resetar banco de dados (CUIDADO: Remove todos os dados!)"""
    if not confirm:
        click.echo("⚠️  Use --confirm para confirmar o reset do banco")
        return
        
    with app.app_context():
        click.echo("🗑️  Removendo todas as tabelas...")
        db.drop_all()
        click.echo("✅ Tabelas removidas")
        
        click.echo("🔧 Recriando tabelas...")
        db.create_all()
        click.echo("✅ Tabelas recriadas")
        
        click.echo("🌱 Populando com dados iniciais...")
        seed.invoke(click.Context(seed))


@cli.command()
def backup():
    """Fazer backup do banco de dados"""
    # Criar diretório de backups se não existir
    backup_dir = Path(current_dir) / 'database_backups'
    backup_dir.mkdir(exist_ok=True)
    
    # Nome do arquivo de backup com timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    with app.app_context():
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        
        if 'sqlite' in db_uri:
            # Backup para SQLite
            db_path = db_uri.replace('sqlite:///', '')
            if os.path.exists(db_path):
                backup_path = backup_dir / f'backup_{timestamp}.db'
                shutil.copy2(db_path, backup_path)
                click.echo(f"✅ Backup criado: {backup_path}")
            else:
                click.echo("❌ Arquivo de banco não encontrado")
        else:
            # Para PostgreSQL, usar pg_dump
            click.echo("🔄 Fazendo backup do PostgreSQL...")
            backup_file = backup_dir / f'backup_{timestamp}.sql'
            os.system(f'pg_dump {db_uri} > {backup_file}')
            click.echo(f"✅ Backup criado: {backup_file}")


@cli.command()
@click.argument('backup_file', type=click.Path(exists=True))
def restore(backup_file):
    """Restaurar backup do banco de dados"""
    with app.app_context():
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        
        if 'sqlite' in db_uri:
            # Restore para SQLite
            db_path = db_uri.replace('sqlite:///', '')
            
            # Fazer backup do banco atual antes de restaurar
            if os.path.exists(db_path):
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                shutil.copy2(db_path, f'{db_path}.before_restore_{timestamp}')
            
            # Restaurar
            shutil.copy2(backup_file, db_path)
            click.echo(f"✅ Backup restaurado de: {backup_file}")
        else:
            # Para PostgreSQL
            click.echo("🔄 Restaurando backup do PostgreSQL...")
            os.system(f'psql {db_uri} < {backup_file}')
            click.echo(f"✅ Backup restaurado de: {backup_file}")


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
def create_admin():
    """Criar usuário administrador"""
    email = click.prompt('Email do admin')
    name = click.prompt('Nome do admin')
    password = click.prompt('Senha', hide_input=True, confirmation_prompt=True)
    
    with app.app_context():
        # Verificar se já existe
        if User.query.filter_by(email=email).first():
            click.echo(f"❌ Usuário {email} já existe")
            return
            
        admin = User(
            email=email,
            name=name,
            password_hash=generate_password_hash(password),
            is_admin=True,
            is_active=True
        )
        
        db.session.add(admin)
        db.session.commit()
        
        click.echo(f"✅ Admin criado: {email}")


if __name__ == '__main__':
    cli()
