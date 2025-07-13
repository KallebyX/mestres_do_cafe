#!/usr/bin/env python3
"""
Script para migrar o banco de dados PostgreSQL com o schema completo
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

def get_db_connection():
    """Conecta ao banco PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'mestres_cafe_db'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )
        return conn
    except psycopg2.Error as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return None

def create_database_if_not_exists():
    """Cria o banco de dados se não existir"""
    try:
        # Conecta ao banco padrão postgres para criar o banco
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database='postgres',
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        db_name = os.getenv('DB_NAME', 'mestres_cafe_db')
        
        # Verifica se o banco existe
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cursor.fetchone()
        
        if not exists:
            print(f"📦 Criando banco de dados: {db_name}")
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"✅ Banco {db_name} criado com sucesso!")
        else:
            print(f"✅ Banco {db_name} já existe")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao criar banco: {e}")
        sys.exit(1)

def run_migration():
    """Executa o schema SQL"""
    # Lê o arquivo SQL
    sql_file = os.path.join(os.path.dirname(__file__), '..', 'models.psql')
    
    if not os.path.exists(sql_file):
        print(f"❌ Arquivo SQL não encontrado: {sql_file}")
        sys.exit(1)
    
    with open(sql_file, 'r', encoding='utf-8') as file:
        sql_content = file.read()
    
    # Conecta ao banco
    conn = get_db_connection()
    if not conn:
        sys.exit(1)
    
    try:
        cursor = conn.cursor()
        
        print("🔄 Executando migration...")
        
        # Executa o SQL
        cursor.execute(sql_content)
        conn.commit()
        
        print("✅ Migration executada com sucesso!")
        
        # Verifica algumas tabelas criadas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print(f"📋 Tabelas criadas: {len(tables)}")
        
        for table in tables[:10]:  # Mostra apenas as primeiras 10
            print(f"   - {table[0]}")
        
        if len(tables) > 10:
            print(f"   ... e mais {len(tables) - 10} tabelas")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Erro durante a migration: {e}")
        conn.rollback()
        conn.close()
        sys.exit(1)

def main():
    """Função principal"""
    print("🚀 Iniciando migração do banco de dados PostgreSQL")
    print("=" * 50)
    
    # Criar banco se não existir
    create_database_if_not_exists()
    
    # Executar migration
    run_migration()
    
    print("=" * 50)
    print("✅ Migração concluída com sucesso!")
    print("\n📝 Próximos passos:")
    print("1. Configure o arquivo .env com suas credenciais")
    print("2. Execute: python -m apps.api.src.app")
    print("3. Acesse: http://localhost:5001/api/health")

if __name__ == "__main__":
    main()