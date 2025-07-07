#!/usr/bin/env python3
"""
🧹 Script de Limpeza Completa de Bancos de Dados
Remove todos os bancos duplicados e organiza um único banco master
"""

import os
import shutil
import sqlite3
from pathlib import Path


def main():
    print("🧹 INICIANDO LIMPEZA COMPLETA DE BANCOS DE DADOS")
    print("=" * 60)
    
    # Definir caminhos dos bancos encontrados
    project_root = "/Users/kalleby/Downloads/mestres_cafe_enterprise"
    databases = [
        f"{project_root}/mestres_cafe.db",
        f"{project_root}/apps/instance/mestres_cafe.db", 
        f"{project_root}/apps/api/mestres_cafe.db",
        f"{project_root}/apps/api/src/instance/mestres_cafe.db"
    ]
    
    # Analisar cada banco
    best_db = None
    best_score = 0
    db_analysis = {}
    
    print("🔍 Analisando bancos existentes...")
    for db_path in databases:
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                
                # Contar tabelas
                cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
                table_count = cursor.fetchone()[0]
                
                # Verificar se reviews existe e quantas colunas tem
                try:
                    cursor.execute("PRAGMA table_info(reviews)")
                    reviews_columns = len(cursor.fetchall())
                except:
                    reviews_columns = 0
                
                # Contar produtos
                try:
                    cursor.execute("SELECT COUNT(*) FROM products")
                    product_count = cursor.fetchone()[0]
                except:
                    product_count = 0
                
                # Calcular score
                score = table_count * 10 + reviews_columns * 5 + product_count
                
                db_analysis[db_path] = {
                    'tables': table_count,
                    'reviews_columns': reviews_columns,
                    'products': product_count,
                    'score': score
                }
                
                print(f"   📊 {db_path}")
                print(f"      - Tabelas: {table_count}")
                print(f"      - Reviews colunas: {reviews_columns}")
                print(f"      - Produtos: {product_count}")
                print(f"      - Score: {score}")
                
                if score > best_score:
                    best_score = score
                    best_db = db_path
                
                conn.close()
                
            except Exception as e:
                print(f"   ❌ Erro ao analisar {db_path}: {e}")
    
    if not best_db:
        print("❌ Nenhum banco válido encontrado!")
        return
    
    print(f"\n👑 Melhor banco escolhido: {best_db}")
    print(f"   Score: {best_score}")
    
    # Definir banco master final
    master_db = f"{project_root}/apps/api/mestres_cafe.db"
    
    # Fazer backup do melhor banco
    backup_dir = f"{project_root}/apps/api/database_backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"\n📋 Copiando melhor banco para {master_db}...")
    if best_db != master_db:
        shutil.copy2(best_db, master_db)
        print("   ✅ Copiado com sucesso")
    else:
        print("   ✅ Já é o banco master")
    
    # Fazer backup de todos os bancos antes de remover
    print(f"\n💾 Fazendo backup de todos os bancos...")
    for db_path in databases:
        if os.path.exists(db_path) and db_path != master_db:
            backup_name = db_path.replace("/", "_").replace(":", "").lstrip("_")
            backup_path = f"{backup_dir}/{backup_name}.backup"
            shutil.copy2(db_path, backup_path)
            print(f"   ✅ {db_path} -> {backup_path}")
    
    # Remover todos os bancos duplicados
    print(f"\n🗑️ Removendo bancos duplicados...")
    for db_path in databases:
        if os.path.exists(db_path) and db_path != master_db:
            os.remove(db_path)
            print(f"   ✅ Removido: {db_path}")
    
    # Verificar banco final
    print(f"\n🔍 Verificando banco master final: {master_db}")
    try:
        conn = sqlite3.connect(master_db)
        cursor = conn.cursor()
        
        # Verificar tabelas
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = cursor.fetchone()[0]
        
        # Verificar reviews
        cursor.execute("PRAGMA table_info(reviews)")
        reviews_info = cursor.fetchall()
        reviews_columns = len(reviews_info)
        
        # Verificar produtos
        cursor.execute("SELECT COUNT(*) FROM products")
        product_count = cursor.fetchone()[0]
        
        print(f"   ✅ {table_count} tabelas")
        print(f"   ✅ Reviews: {reviews_columns} colunas")
        print(f"   ✅ Produtos: {product_count}")
        
        if reviews_columns >= 17:
            print("   🎉 Estrutura premium de reviews confirmada!")
        
        # Mostrar colunas da tabela reviews
        print(f"\n   📋 Colunas da tabela reviews:")
        for col in reviews_info:
            print(f"      - {col[1]} ({col[2]})")
        
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Erro ao verificar banco final: {e}")
    
    # Limpar diretórios instance vazios
    print(f"\n🧹 Limpando diretórios instance vazios...")
    instance_dirs = [
        f"{project_root}/apps/instance",
        f"{project_root}/apps/api/src/instance"
    ]
    
    for instance_dir in instance_dirs:
        if os.path.exists(instance_dir):
            try:
                if not os.listdir(instance_dir):  # Se vazio
                    os.rmdir(instance_dir)
                    print(f"   ✅ Removido diretório vazio: {instance_dir}")
                else:
                    print(f"   ⚠️ Diretório não vazio mantido: {instance_dir}")
            except:
                pass
    
    print(f"\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!")
    print(f"   📁 Banco único: {master_db}")
    print(f"   💾 Backups em: {backup_dir}")
    print(f"   🗑️ Duplicados removidos")
    print(f"\n✅ Reinicie o Flask para aplicar as mudanças!")

if __name__ == "__main__":
    main()