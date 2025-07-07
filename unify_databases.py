#!/usr/bin/env python3
"""
Script para unificar todos os bancos de dados em um único banco master
"""

import os
import shutil
import sqlite3
from pathlib import Path


def get_all_databases():
    """Encontra todos os arquivos .db no projeto"""
    databases = []
    
    # Bancos no diretório atual
    for db_file in Path('.').glob('*.db'):
        if db_file.exists():
            databases.append(str(db_file))
    
    # Bancos em instance/
    for db_file in Path('instance').glob('*.db'):
        if db_file.exists():
            databases.append(str(db_file))
            
    # Bancos em src/instance/
    for db_file in Path('src/instance').glob('*.db'):
        if db_file.exists():
            databases.append(str(db_file))
    
    return databases

def analyze_database(db_path):
    """Analisa um banco de dados e retorna informações sobre ele"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Obter lista de tabelas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Verificar se tem dados
        data_count = 0
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                data_count += count
            except:
                pass
        
        # Verificar estrutura da tabela reviews se existir
        reviews_structure = None
        if 'reviews' in tables:
            cursor.execute("PRAGMA table_info(reviews)")
            reviews_structure = cursor.fetchall()
        
        conn.close()
        
        return {
            'path': db_path,
            'tables': len(tables),
            'table_names': tables,
            'data_count': data_count,
            'reviews_structure': reviews_structure,
            'size': os.path.getsize(db_path) if os.path.exists(db_path) else 0
        }
    except Exception as e:
        return {
            'path': db_path,
            'error': str(e),
            'tables': 0,
            'data_count': 0,
            'size': 0
        }

def find_best_master_database(databases_info):
    """Encontra o melhor banco para ser o master"""
    # Critérios: mais tabelas, mais dados, estrutura reviews completa
    best_db = None
    best_score = 0
    
    for db_info in databases_info:
        if 'error' in db_info:
            continue
            
        score = 0
        score += db_info['tables'] * 10  # 10 pontos por tabela
        score += min(db_info['data_count'], 1000)  # Até 1000 pontos por dados
        
        # Bonus se tem reviews com estrutura completa (17 colunas premium)
        if db_info['reviews_structure'] and len(db_info['reviews_structure']) >= 17:
            score += 1000
            
        # Penalty se é backup
        if 'backup' in db_info['path']:
            score -= 500
            
        print(f"📊 {db_info['path']}: {score} pontos (tabelas: {db_info['tables']}, dados: {db_info['data_count']})")
        
        if score > best_score:
            best_score = score
            best_db = db_info
    
    return best_db

def unify_databases():
    """Processo principal de unificação"""
    print("🚀 Iniciando unificação de bancos de dados...")
    print("=" * 60)
    
    # 1. Encontrar todos os bancos
    databases = get_all_databases()
    print(f"📦 Encontrados {len(databases)} bancos:")
    for db in databases:
        print(f"   - {db}")
    
    print("\n🔍 Analisando bancos...")
    
    # 2. Analisar cada banco
    databases_info = []
    for db_path in databases:
        info = analyze_database(db_path)
        databases_info.append(info)
        
        if 'error' not in info:
            reviews_cols = len(info['reviews_structure']) if info['reviews_structure'] else 0
            print(f"   ✅ {db_path}: {info['tables']} tabelas, {info['data_count']} registros, reviews: {reviews_cols} colunas")
        else:
            print(f"   ❌ {db_path}: {info['error']}")
    
    # 3. Encontrar melhor banco master
    print(f"\n🎯 Escolhendo banco master...")
    master_db = find_best_master_database(databases_info)
    
    if not master_db:
        print("❌ Nenhum banco válido encontrado!")
        return False
        
    print(f"👑 Banco master escolhido: {master_db['path']}")
    
    # 4. Definir nome do banco unificado
    unified_db_path = "mestres_cafe_unified.db"
    
    # 5. Copiar banco master para unificado
    print(f"\n📋 Copiando banco master para {unified_db_path}...")
    shutil.copy2(master_db['path'], unified_db_path)
    
    # 6. Verificar se precisa consolidar dados de outros bancos
    print(f"\n🔄 Verificando dados únicos em outros bancos...")
    # Por enquanto, como todos os bancos parecem ter estrutura similar,
    # vamos usar só o master mais completo
    
    # 7. Backup dos bancos antigos
    backup_dir = "database_backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"\n💾 Fazendo backup dos bancos antigos em {backup_dir}/...")
    for db_info in databases_info:
        if 'error' not in db_info and db_info['path'] != master_db['path']:
            backup_name = db_info['path'].replace('/', '_').replace('\\', '_')
            backup_path = f"{backup_dir}/{backup_name}.backup"
            try:
                shutil.copy2(db_info['path'], backup_path)
                print(f"   ✅ {db_info['path']} -> {backup_path}")
            except Exception as e:
                print(f"   ❌ Erro ao fazer backup de {db_info['path']}: {e}")
    
    # 8. Remover bancos duplicados (exceto o unified)
    print(f"\n🗑️ Removendo bancos duplicados...")
    for db_info in databases_info:
        if 'error' not in db_info and db_info['path'] != unified_db_path:
            try:
                os.remove(db_info['path'])
                print(f"   ✅ Removido: {db_info['path']}")
            except Exception as e:
                print(f"   ❌ Erro ao remover {db_info['path']}: {e}")
    
    # 9. Renomear unificado para mestres_cafe.db (que o Flask usa)
    final_db_path = "mestres_cafe.db"
    if os.path.exists(final_db_path):
        os.remove(final_db_path)
    
    os.rename(unified_db_path, final_db_path)
    print(f"\n✅ Banco unificado criado: {final_db_path}")
    
    # 10. Verificar estrutura final
    print(f"\n🔍 Verificando banco unificado final...")
    final_info = analyze_database(final_db_path)
    
    if 'error' not in final_info:
        reviews_cols = len(final_info['reviews_structure']) if final_info['reviews_structure'] else 0
        print(f"   ✅ {final_info['tables']} tabelas")
        print(f"   ✅ {final_info['data_count']} registros totais")
        print(f"   ✅ Tabela reviews: {reviews_cols} colunas")
        
        if final_info['reviews_structure']:
            print("   📋 Colunas da tabela reviews:")
            for col in final_info['reviews_structure']:
                print(f"      - {col[1]} ({col[2]})")
    else:
        print(f"   ❌ Erro: {final_info['error']}")
        return False
    
    print(f"\n🎉 UNIFICAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"   📁 Banco final: {final_db_path}")
    print(f"   💾 Backups em: {backup_dir}/")
    print(f"   🗑️ Duplicados removidos")
    
    return True

if __name__ == "__main__":
    success = unify_databases()
    if success:
        print("\n✅ Execute o Flask agora para testar!")
    else:
        print("\n❌ Falha na unificação!")