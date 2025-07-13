#!/usr/bin/env python3
"""
Setup inicial do banco de dados - Mestres do Café
Script para configuração inicial sem dependência do Alembic
"""

import sys
from pathlib import Path

# Adicionar diretório correto ao path
current_dir = Path(__file__).parent.parent
api_dir = current_dir / "apps" / "api" / "src"
sys.path.insert(0, str(api_dir))


def setup_database():
    """Configuração inicial do banco de dados"""
    print("🚀 Configurando banco de dados inicial...")

    try:
        # Importar dependências
        from app import create_app
        from models.base import db

        # Criar aplicação
        app = create_app()

        with app.app_context():
            print("📋 Criando estrutura do banco...")

            # Criar todas as tabelas
            db.create_all()

            # Verificar quantas tabelas foram criadas
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()

            print(f"✅ {len(tables)} tabelas criadas com sucesso!")

            # Listar principais tabelas criadas
            principais = ["user", "product", "category", "order", "cart"]
            encontradas = [t for t in principais if t in tables]

            if encontradas:
                print(f"📊 Principais tabelas: {', '.join(encontradas)}")

            print("✅ Configuração inicial concluída!")
            print("\n🎯 Próximos passos:")
            print("   1. Execute: python scripts/db_manager.py seed")
            print("   2. Ou use: make db-seed")
            print("   3. Para verificar: make db-status")

            return True

    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        print("💡 Verifique se as dependências estão instaladas")
        return False
    except Exception as e:
        print(f"❌ Erro durante configuração: {e}")
        return False


if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)
