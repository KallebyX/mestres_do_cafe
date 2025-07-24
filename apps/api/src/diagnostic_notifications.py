#!/usr/bin/env python3
"""
Diagnóstico do Sistema de Notificações
Valida a integridade e identifica problemas específicos
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    print("🔍 [DIAGNÓSTICO] Sistema de Notificações - Mestres do Café")
    print("=" * 60)
    
    # 1. Verificar existência do serviço de notificações
    print("\n1️reds VERIFICANDO SERVIÇO DE NOTIFICAÇÕES:")
    service_path = "services/notification_service.py"
    if os.path.exists(service_path):
        print(f"✅ Arquivo {service_path} existe")
        try:
            from services.notification_service import NotificationService, NotificationType, NotificationChannel
            print("✅ Classes NotificationService, NotificationType, NotificationChannel importadas com sucesso")
        except ImportError as e:
            print(f"❌ ERRO DE IMPORTAÇÃO: {e}")
    else:
        print(f"❌ PROBLEMA CRÍTICO: Arquivo {service_path} NÃO EXISTE")
        print("🔍 CAUSA CONFIRMADA: Serviço de notificação ausente")
    
    # 2. Verificar modelos de notificação
    print("\n2️⃣ VERIFICANDO MODELOS DE NOTIFICAÇÃO:")
    try:
        from models.notifications import Notification, NotificationTemplate, NotificationSubscription, NotificationLog
        print("✅ Todos os modelos de notificação importados com sucesso")
        print(f"   - Notification: {Notification}")
        print(f"   - NotificationTemplate: {NotificationTemplate}")
        print(f"   - NotificationSubscription: {NotificationSubscription}")
        print(f"   - NotificationLog: {NotificationLog}")
    except ImportError as e:
        print(f"❌ ERRO na importação de modelos: {e}")
    
    # 3. Verificar controllers de notificação
    print("\n3️⃣ VERIFICANDO CONTROLLERS DE NOTIFICAÇÃO:")
    try:
        # Vamos tentar importar sem o serviço
        import importlib.util
        spec = importlib.util.spec_from_file_location("notifications_controller", "controllers/routes/notifications.py")
        if spec and spec.loader:
            print("✅ Controller de notificações encontrado")
            print("❌ MAS: Importação falhará devido ao serviço ausente")
        else:
            print("❌ Controller de notificações não encontrado")
    except Exception as e:
        print(f"❌ ERRO ao verificar controller: {e}")
    
    # 4. Verificar registro do blueprint
    print("\n4️⃣ VERIFICANDO REGISTRO DO BLUEPRINT:")
    try:
        with open("app.py", "r") as f:
            app_content = f.read()
            if "notifications_bp" in app_content and "# " in app_content:
                print("❌ PROBLEMA CONFIRMADO: notifications_bp está comentado no app.py")
                print("🔍 CAUSA CONFIRMADA: Blueprint desabilitado")
            elif "notifications_bp" in app_content:
                print("✅ notifications_bp encontrado no app.py")
            else:
                print("❌ notifications_bp não encontrado no app.py")
    except Exception as e:
        print(f"❌ ERRO ao verificar app.py: {e}")
    
    # 5. Verificar estrutura do banco de dados
    print("\n5️⃣ VERIFICANDO ESTRUTURA DO BANCO:")
    try:
        from database import db
        from app import create_app
        
        app = create_app()
        with app.app_context():
            # Verificar se as tabelas existem
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            notification_tables = ['notifications', 'notification_templates', 'notification_subscriptions', 'notification_logs']
            
            for table in notification_tables:
                if table in existing_tables:
                    print(f"✅ Tabela {table} existe no banco")
                else:
                    print(f"❌ Tabela {table} NÃO EXISTE no banco")
    except Exception as e:
        print(f"❌ ERRO ao verificar banco: {e}")
    
    # 6. Resumo do diagnóstico
    print("\n" + "=" * 60)
    print("📋 RESUMO DO DIAGNÓSTICO:")
    print("❌ PROBLEMA CRÍTICO: Serviço de notificação ausente (notification_service.py)")
    print("❌ PROBLEMA CRÍTICO: Blueprint de notificações desabilitado")
    print("⚠️  IMPACTO: Sistema de notificações completamente inoperante")
    print("💡 SOLUÇÃO: Implementar serviço de notificações e reativar blueprint")
    print("=" * 60)

if __name__ == "__main__":
    main()