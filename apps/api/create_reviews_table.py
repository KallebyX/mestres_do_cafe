#!/usr/bin/env python3
"""
Script para criar a tabela reviews diretamente no banco
"""

import os
import psycopg2
from urllib.parse import urlparse

def create_reviews_table():
    """Cria a tabela reviews no banco de dados"""
    
    # Obter DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL não encontrada")
        return False
    
    try:
        # Conectar ao banco
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # SQL para criar a tabela reviews
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS reviews (
            id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
            product_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36),
            rating INTEGER NOT NULL,
            title VARCHAR(255),
            comment TEXT,
            is_verified BOOLEAN DEFAULT FALSE,
            is_approved BOOLEAN DEFAULT TRUE,
            is_featured BOOLEAN DEFAULT FALSE,
            helpful_count INTEGER DEFAULT 0,
            not_helpful_count INTEGER DEFAULT 0,
            pros JSON,
            cons JSON,
            images JSON,
            recommend BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        conn.commit()
        
        print("✅ Tabela reviews criada com sucesso")
        
        # Verificar se foi criada
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_name = 'reviews'
        """)
        count = cursor.fetchone()[0]
        
        if count > 0:
            print("✅ Tabela reviews confirmada no banco")
            return True
        else:
            print("❌ Tabela reviews não foi encontrada após criação")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao criar tabela reviews: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    success = create_reviews_table()
    exit(0 if success else 1)
