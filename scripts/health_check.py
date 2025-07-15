#!/usr/bin/env python3
"""
Health Check do Sistema Mestres do Café Enterprise
Verifica se todos os serviços estão funcionando corretamente
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, List

class HealthChecker:
    """Verificador de saúde do sistema"""
    
    def __init__(self, base_url: str = "http://localhost:5001"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.timeout = 10
        self.results = []
    
    def check_endpoint(self, name: str, endpoint: str, expected_status: int = 200) -> Dict[str, Any]:
        """Verifica um endpoint específico"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            start_time = time.time()
            response = self.session.get(url)
            response_time = (time.time() - start_time) * 1000  # em ms
            
            result = {
                "name": name,
                "url": url,
                "status_code": response.status_code,
                "response_time_ms": round(response_time, 2),
                "success": response.status_code == expected_status,
                "timestamp": datetime.now().isoformat()
            }
            
            if response.status_code == expected_status:
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text[:200]
            else:
                result["error"] = f"Expected {expected_status}, got {response.status_code}"
                result["response_text"] = response.text[:200]
            
            return result
            
        except requests.RequestException as e:
            return {
                "name": name,
                "url": url,
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def check_health_endpoints(self) -> List[Dict[str, Any]]:
        """Verifica endpoints de saúde básicos"""
        endpoints = [
            ("API Health", "/api/health"),
            ("API Info", "/api/info"),
            ("Monitoring Health", "/api/monitoring/health"),
            ("System Metrics", "/api/monitoring/metrics/system"),
            ("Cache Stats", "/api/monitoring/cache/stats"),
        ]
        
        results = []
        for name, endpoint in endpoints:
            result = self.check_endpoint(name, endpoint)
            results.append(result)
            
        return results
    
    def check_analytics_endpoints(self) -> List[Dict[str, Any]]:
        """Verifica endpoints de analytics"""
        endpoints = [
            ("Analytics Dashboard", "/api/analytics/dashboard?days=7"),
            ("Real-time Metrics", "/api/analytics/realtime"),
            ("KPIs", "/api/analytics/kpis"),
        ]
        
        results = []
        for name, endpoint in endpoints:
            result = self.check_endpoint(name, endpoint)
            results.append(result)
            
        return results
    
    def check_recommendation_endpoints(self) -> List[Dict[str, Any]]:
        """Verifica endpoints de recomendações"""
        endpoints = [
            ("Trending Products", "/api/recommendations/trending"),
            ("Recommendation Performance", "/api/recommendations/analytics/performance"),
        ]
        
        results = []
        for name, endpoint in endpoints:
            result = self.check_endpoint(name, endpoint)
            results.append(result)
            
        return results
    
    def check_tenant_endpoints(self) -> List[Dict[str, Any]]:
        """Verifica endpoints de multi-tenancy"""
        endpoints = [
            ("Available Plans", "/api/tenants/plans"),
            ("Validate Slug", "/api/tenants/validate-slug", 405),  # POST only
        ]
        
        results = []
        for name, endpoint, *status in endpoints:
            expected_status = status[0] if status else 200
            result = self.check_endpoint(name, endpoint, expected_status)
            results.append(result)
            
        return results
    
    def check_security_endpoints(self) -> List[Dict[str, Any]]:
        """Verifica endpoints de segurança"""
        endpoints = [
            ("CSRF Token", "/api/csrf-token"),
            ("Security Report", "/api/security/security-report"),
            ("Rate Limits", "/api/security/rate-limits"),
        ]
        
        results = []
        for name, endpoint in endpoints:
            result = self.check_endpoint(name, endpoint)
            results.append(result)
            
        return results
    
    def check_integration_endpoints(self) -> List[Dict[str, Any]]:
        """Verifica endpoints de integração (podem falhar sem credenciais)"""
        endpoints = [
            ("Mercado Pago Methods", "/api/payments/mercadopago/payment-methods"),
            ("Escrow Stats", "/api/escrow/stats"),
        ]
        
        results = []
        for name, endpoint in endpoints:
            result = self.check_endpoint(name, endpoint)
            # Para integrações, não marcamos como falha se der 401/403
            if result.get("status_code") in [401, 403]:
                result["success"] = True
                result["note"] = "Protected endpoint (credentials required)"
            results.append(result)
            
        return results
    
    def run_all_checks(self) -> Dict[str, Any]:
        """Executa todas as verificações"""
        print(f"🔍 Verificando saúde do sistema: {self.base_url}")
        print("=" * 60)
        
        all_results = {
            "timestamp": datetime.now().isoformat(),
            "base_url": self.base_url,
            "categories": {}
        }
        
        # Verifica cada categoria
        categories = [
            ("Core Health", self.check_health_endpoints),
            ("Analytics", self.check_analytics_endpoints),
            ("Recommendations", self.check_recommendation_endpoints),
            ("Multi-tenancy", self.check_tenant_endpoints),
            ("Security", self.check_security_endpoints),
            ("Integrations", self.check_integration_endpoints),
        ]
        
        total_checks = 0
        total_passed = 0
        
        for category_name, check_function in categories:
            print(f"\n📋 {category_name}")
            results = check_function()
            
            category_passed = 0
            for result in results:
                total_checks += 1
                status = "✅" if result["success"] else "❌"
                name = result["name"]
                
                if result["success"]:
                    total_passed += 1
                    category_passed += 1
                    response_time = result.get("response_time_ms", 0)
                    print(f"  {status} {name} ({response_time}ms)")
                else:
                    error = result.get("error", "Unknown error")
                    print(f"  {status} {name} - {error}")
            
            all_results["categories"][category_name] = {
                "results": results,
                "passed": category_passed,
                "total": len(results),
                "success_rate": (category_passed / len(results)) * 100 if results else 0
            }
        
        # Resumo geral
        print("\n" + "=" * 60)
        print(f"📊 RESUMO GERAL")
        print(f"   Total de verificações: {total_checks}")
        print(f"   ✅ Passou: {total_passed}")
        print(f"   ❌ Falhou: {total_checks - total_passed}")
        print(f"   📈 Taxa de sucesso: {(total_passed/total_checks)*100:.1f}%")
        
        all_results["summary"] = {
            "total_checks": total_checks,
            "total_passed": total_passed,
            "total_failed": total_checks - total_passed,
            "success_rate": (total_passed / total_checks) * 100 if total_checks > 0 else 0
        }
        
        # Status final
        if total_passed == total_checks:
            print(f"\n🎉 SISTEMA TOTALMENTE SAUDÁVEL!")
            all_results["overall_status"] = "healthy"
        elif total_passed >= total_checks * 0.8:  # 80% ou mais
            print(f"\n✅ SISTEMA SAUDÁVEL (alguns serviços opcionais podem estar offline)")
            all_results["overall_status"] = "mostly_healthy"
        else:
            print(f"\n⚠️ SISTEMA COM PROBLEMAS - Verifique os serviços com falha")
            all_results["overall_status"] = "unhealthy"
        
        return all_results
    
    def save_report(self, results: Dict[str, Any], filename: str = None):
        """Salva relatório em arquivo"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"health_report_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Relatório salvo em: {filename}")

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Health Check do Sistema Mestres do Café')
    parser.add_argument('--url', default='http://localhost:5001', 
                       help='URL base da API (default: http://localhost:5001)')
    parser.add_argument('--save', action='store_true',
                       help='Salvar relatório em arquivo JSON')
    parser.add_argument('--output', type=str,
                       help='Nome do arquivo de saída')
    
    args = parser.parse_args()
    
    try:
        checker = HealthChecker(args.url)
        results = checker.run_all_checks()
        
        if args.save or args.output:
            checker.save_report(results, args.output)
        
        # Exit code baseado na saúde do sistema
        overall_status = results.get("overall_status", "unhealthy")
        if overall_status == "healthy":
            sys.exit(0)
        elif overall_status == "mostly_healthy":
            sys.exit(1)
        else:
            sys.exit(2)
            
    except KeyboardInterrupt:
        print("\n\nVerificação cancelada pelo usuário.")
        sys.exit(130)
    except Exception as e:
        print(f"\nErro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()