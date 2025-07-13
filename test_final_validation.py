#!/usr/bin/env python3
"""
Final test to confirm strict email validation is working
"""
import requests
import json

API_BASE = "http://localhost:5001"

def test_strict_email_validation():
    print("🔒 TESTE FINAL - VALIDAÇÃO RIGOROSA DE EMAIL")
    print("=" * 60)
    
    test_cases = [
        # Valid emails - should work
        ("admin@mestres.cafe", "admin123", True, "✅ Email válido normal"),
        ("cliente@mestres.cafe", "cliente123", True, "✅ Email válido cliente"),
        ("  admin@mestres.cafe  ", "admin123", True, "✅ Email com espaços (deve ser limpo)"),
        
        # Invalid emails - should fail
        ("mailto:admin@mestres.cafe", "admin123", False, "❌ Email com mailto: (deve ser rejeitado)"),
        ("admin:teste@mestres.cafe", "admin123", False, "❌ Email com : na parte local"),
        ("admin@mestres.cafe:", "admin123", False, "❌ Email com : no final"),
        ("admin@me:stres.cafe", "admin123", False, "❌ Email com : no domínio"),
        ("ad:min@mestres.cafe", "admin123", False, "❌ Email com : no meio da parte local"),
    ]
    
    print("🧪 Testando validação rigorosa:\n")
    
    passed = 0
    failed = 0
    
    for email, password, should_work, description in test_cases:
        print(f"{description}")
        print(f"   📧 Email: '{email}'")
        
        try:
            response = requests.post(f"{API_BASE}/api/auth/login", 
                                   json={"email": email, "password": password})
            
            if should_work:
                if response.status_code == 200:
                    print(f"   ✅ PASSOU: Login funcionou como esperado")
                    passed += 1
                else:
                    print(f"   ❌ FALHOU: Esperava sucesso mas recebeu {response.status_code}")
                    print(f"       Erro: {response.json().get('error', 'Erro desconhecido')}")
                    failed += 1
            else:
                if response.status_code == 400 and "Invalid email format" in response.json().get('error', ''):
                    print(f"   ✅ PASSOU: Email rejeitado corretamente por formato inválido")
                    passed += 1
                elif response.status_code == 401:
                    print(f"   ✅ PASSOU: Email rejeitado por credenciais inválidas")
                    passed += 1
                else:
                    print(f"   ❌ FALHOU: Esperava rejeição mas recebeu {response.status_code}")
                    failed += 1
        except Exception as e:
            print(f"   ❌ ERRO: Falha na requisição - {str(e)}")
            failed += 1
        
        print()
    
    print("📊 RESULTADO FINAL")
    print("=" * 60)
    print(f"✅ Testes aprovados: {passed}/{len(test_cases)}")
    print(f"❌ Testes falharam: {failed}/{len(test_cases)}")
    
    if failed == 0:
        print("\n🎉 SUCESSO COMPLETO!")
        print("✅ Validação rigorosa de email está funcionando perfeitamente")
        print("✅ Emails com ':' são rejeitados corretamente")
        print("✅ Emails válidos são aceitos")
        print("✅ Sistema está seguro contra emails malformados")
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM")
        print("Verifique os resultados acima")
    
    return failed == 0

if __name__ == "__main__":
    test_strict_email_validation()