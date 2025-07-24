#!/usr/bin/env python3
"""
DIAGNÓSTICO COMPLETO: Sistema de Impostos e Compliance Fiscal
Mestres do Café Enterprise - Tarefa 17

Este script realiza uma análise abrangente do sistema de impostos,
compliance fiscal e questões de tributação no e-commerce.
"""

import os
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def analyze_tax_system():
    """
    Análise completa do sistema de impostos e compliance fiscal
    """
    print("\n🔍 ANÁLISE 1: Estrutura de Dados Fiscais")
    print("=" * 60)
    
    # Lista para armazenar problemas encontrados
    issues_found = []
    
    # 1. ANÁLISE DA ESTRUTURA DE DADOS FISCAIS
    tax_fields_found = []
    
    # Diretórios para analisar
    analyze_dirs = [
        'src/models',
        'src/controllers',
        'src/services',
        'src/middleware'
    ]
    
    for directory in analyze_dirs:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                                # Verificar campos relacionados a impostos
                                tax_indicators = [
                                    'tax_amount', 'tax_total', 'tax_rate',
                                    'tax_percentage', 'icms', 'ipi', 'pis',
                                    'cofins', 'iss', 'irpj', 'csll',
                                    'fiscal_classification', 'ncm', 'cfop',
                                    'cest', 'tax_exempt', 'tax_exemption',
                                    'tributacao'
                                ]
                                
                                for indicator in tax_indicators:
                                    if indicator in content:
                                        tax_fields_found.append({
                                            'file': file_path,
                                            'field': indicator
                                        })
                        except Exception:
                            continue
    
    print(f"   📊 Campos fiscais encontrados: {len(tax_fields_found)}")
    for field in tax_fields_found[:5]:  # Mostrar apenas primeiros 5
        print(f"   - {field['field']} em {field['file']}")
    
    if len(tax_fields_found) > 5:
        print(f"   ... e mais {len(tax_fields_found) - 5} campos")
    
    # 2. ANÁLISE COMPLIANCE BRASIL
    print("\n🇧🇷 ANÁLISE 2: Compliance Fiscal Brasil")
    print("=" * 60)
    
    brazil_compliance_issues = []
    
    # Verificar se há suporte a ICMS (obrigatório para e-commerce)
    icms_support = any('icms' in item['field'].lower()
                       for item in tax_fields_found)
    
    if not icms_support:
        brazil_compliance_issues.append({
            'issue': 'ICMS não implementado',
            'severity': 'CRITICAL',
            'description': 'ICMS é obrigatório para e-commerce no Brasil',
            'legal_requirement': 'Lei Complementar 87/1996 (Lei Kandir)'
        })
    
    # Verificar PIS/COFINS
    pis_support = any('pis' in item['field'].lower()
                      for item in tax_fields_found)
    cofins_support = any('cofins' in item['field'].lower()
                         for item in tax_fields_found)
    
    if not pis_support or not cofins_support:
        brazil_compliance_issues.append({
            'issue': 'PIS/COFINS não implementado',
            'severity': 'HIGH',
            'description': 'PIS/COFINS são tributos federais obrigatórios',
            'legal_requirement': 'Lei 10.833/2003'
        })
    
    # Verificar NCM (Nomenclatura Comum do Mercosul)
    ncm_support = any('ncm' in item['field'].lower()
                      for item in tax_fields_found)
    
    if not ncm_support:
        brazil_compliance_issues.append({
            'issue': 'Código NCM não implementado',
            'severity': 'CRITICAL',
            'description': 'NCM obrigatório para classificação fiscal',
            'legal_requirement': 'Decreto 7.212/2010'
        })
    
    # Verificar CFOP (Código Fiscal de Operações e Prestações)
    cfop_support = any('cfop' in item['field'].lower()
                       for item in tax_fields_found)
    
    if not cfop_support:
        brazil_compliance_issues.append({
            'issue': 'CFOP não implementado',
            'severity': 'CRITICAL',
            'description': 'CFOP obrigatório para operações fiscais',
            'legal_requirement': 'Ajuste SINIEF 02/89'
        })
    
    print(f"   🚨 Problemas de compliance: {len(brazil_compliance_issues)}")
    for issue in brazil_compliance_issues:
        severity_emoji = "🔴" if issue['severity'] == 'CRITICAL' else "🟡"
        print(f"   {severity_emoji} {issue['issue']} ({issue['severity']})")
    
    # 3. ANÁLISE MÉTODOS DE CÁLCULO
    print("\n🧮 ANÁLISE 3: Métodos de Cálculo Fiscal")
    print("=" * 60)
    
    tax_calculation_methods = []
    calculation_issues = []
    
    # Procurar por métodos de cálculo
    calc_indicators = [
        'calculate_tax', 'calcular_imposto', 'tax_calculation',
        'calculate_icms', 'calculate_pis', 'calculate_cofins'
    ]
    
    for directory in analyze_dirs:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                                for indicator in calc_indicators:
                                    if indicator in content:
                                        tax_calculation_methods.append({
                                            'file': file_path,
                                            'method': indicator
                                        })
                                
                                # Verificar se usa float para cálculos monetários
                                if ('float(' in content and
                                        ('tax' in content or 'amount' in content)):
                                    calculation_issues.append({
                                        'issue': 'Uso de float para monetário',
                                        'severity': 'HIGH',
                                        'file': file_path,
                                        'description': 'Float causa erros de arredondamento',
                                        'solution': 'Usar Decimal para precisão'
                                    })
                        except Exception:
                            continue
    
    # Verificar se há métodos de cálculo
    if not tax_calculation_methods:
        calculation_issues.append({
            'issue': 'Nenhum método de cálculo fiscal encontrado',
            'severity': 'CRITICAL',
            'description': 'Sistema não possui lógica de cálculo de impostos',
            'impact': 'Valores incorretos de impostos'
        })
    
    print(f"   📊 Métodos de cálculo encontrados: {len(tax_calculation_methods)}")
    print(f"   🚨 Problemas de cálculo: {len(calculation_issues)}")
    
    # 4. ANÁLISE DIFERENCIAÇÃO PF/PJ
    print("\n👥 ANÁLISE 4: Diferenciação PF/PJ")
    print("=" * 60)
    
    pf_pj_issues = []
    pf_pj_support = []
    
    # Procurar indicadores de diferenciação PF/PJ
    pf_pj_indicators = [
        'customer_type', 'person_type', 'cpf', 'cnpj',
        'tax_exempt', 'business_customer', 'individual_customer'
    ]
    
    for directory in analyze_dirs:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                                for indicator in pf_pj_indicators:
                                    if indicator in content:
                                        pf_pj_support.append({
                                            'file': file_path,
                                            'indicator': indicator
                                        })
                        except Exception:
                            continue
    
    if len(pf_pj_support) < 2:
        pf_pj_issues.append({
            'issue': 'Diferenciação PF/PJ insuficiente',
            'severity': 'HIGH',
            'description': 'Sistema não diferencia adequadamente PF e PJ',
            'impact': 'Tributação incorreta por tipo de cliente'
        })
    
    print(f"   📊 Indicadores PF/PJ encontrados: {len(pf_pj_support)}")
    print(f"   🚨 Problemas PF/PJ: {len(pf_pj_issues)}")
    
    # 5. ANÁLISE INTEGRAÇÃO SEFAZ
    print("\n🏛️ ANÁLISE 5: Integração SEFAZ/NFe")
    print("=" * 60)
    
    sefaz_issues = []
    sefaz_support = []
    
    # Procurar indicadores de integração SEFAZ
    sefaz_indicators = [
        'sefaz', 'nfe', 'nfce', 'cte', 'mdfe',
        'soap', 'webservice', 'certificado_digital'
    ]
    
    for directory in analyze_dirs:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                                for indicator in sefaz_indicators:
                                    if indicator in content:
                                        sefaz_support.append({
                                            'file': file_path,
                                            'indicator': indicator
                                        })
                        except Exception:
                            continue
    
    if not sefaz_support:
        sefaz_issues.append({
            'issue': 'Integração SEFAZ não encontrada',
            'severity': 'CRITICAL',
            'description': 'Sem integração para emissão de NFe',
            'legal_requirement': 'Protocolo ICMS 42/2009'
        })
    
    print(f"   📊 Indicadores SEFAZ encontrados: {len(sefaz_support)}")
    print(f"   🚨 Problemas SEFAZ: {len(sefaz_issues)}")
    
    # 6. ANÁLISE ARMAZENAMENTO FISCAL
    print("\n💾 ANÁLISE 6: Armazenamento Dados Fiscais")
    print("=" * 60)
    
    storage_issues = []
    fiscal_tables = []
    
    # Procurar por tabelas/modelos fiscais
    fiscal_table_indicators = [
        'class.*Tax', 'class.*Fiscal', 'class.*Invoice',
        'class.*Tribute', 'class.*ICMS'
    ]
    
    for directory in ['src/models']:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                                for indicator in fiscal_table_indicators:
                                    import re
                                    if re.search(indicator, content, re.IGNORECASE):
                                        fiscal_tables.append({
                                            'file': file_path,
                                            'pattern': indicator
                                        })
                        except Exception:
                            continue
    
    if not fiscal_tables:
        storage_issues.append({
            'issue': 'Modelos fiscais não encontrados',
            'severity': 'HIGH',
            'description': 'Sem estrutura dedicada para dados fiscais',
            'impact': 'Dificuldade para auditoria e compliance'
        })
    
    print(f"   📊 Modelos fiscais encontrados: {len(fiscal_tables)}")
    print(f"   🚨 Problemas de armazenamento: {len(storage_issues)}")
    
    # CONSOLIDAÇÃO DOS RESULTADOS
    print("\n📋 RESUMO EXECUTIVO")
    print("=" * 60)
    
    # Contar problemas por severidade
    all_issues = (brazil_compliance_issues + calculation_issues + 
                  pf_pj_issues + sefaz_issues + storage_issues)
    
    critical_issues = [i for i in all_issues if i['severity'] == 'CRITICAL']
    high_issues = [i for i in all_issues if i['severity'] == 'HIGH']
    medium_issues = [i for i in all_issues if i['severity'] == 'MEDIUM']
    
    print(f"   📊 Campos de impostos encontrados: {len(tax_fields_found)}")
    print(f"   🔴 Críticos: {len(critical_issues)}")
    print(f"   🟡 Altos: {len(high_issues)}")
    print(f"   🟢 Médios: {len(medium_issues)}")
    
    # Listar problemas críticos
    if critical_issues:
        print("\n🔴 PROBLEMAS CRÍTICOS:")
        for i, issue in enumerate(critical_issues, 1):
            print(f"   {i}. {issue['issue']}")
            if 'legal_requirement' in issue:
                print(f"      📋 Base legal: {issue['legal_requirement']}")
    
    # Listar problemas altos
    if high_issues:
        print("\n🟡 PROBLEMAS ALTOS:")
        for i, issue in enumerate(high_issues, 1):
            print(f"   {i}. {issue['issue']}")
    
    # Listar problemas médios
    if medium_issues:
        print("\n🟢 PROBLEMAS MÉDIOS:")
        for i, issue in enumerate(medium_issues, 1):
            print(f"   {i}. {issue['issue']}")
    
    # RECOMENDAÇÕES PRIORITÁRIAS
    print("\n💡 RECOMENDAÇÕES PRIORITÁRIAS")
    print("=" * 60)
    
    recommendations = [
        "1. 🏛️ Implementar integração SEFAZ para emissão de NFe",
        "2. 🏷️ Adicionar campos NCM e CFOP nos produtos",
        "3. 💰 Implementar cálculo de ICMS por estado",
        "4. 🧮 Criar lógica de cálculo PIS/COFINS",
        "5. 👥 Melhorar diferenciação tributária PF/PJ",
        "6. 💾 Criar modelos dedicados para dados fiscais",
        "7. 🔢 Substituir float por Decimal em cálculos",
        "8. 📋 Implementar auditoria fiscal completa"
    ]
    
    for rec in recommendations:
        print(f"   {rec}")
    
    # STATUS FINAL
    print(f"\n🎯 STATUS DE COMPLIANCE FISCAL")
    print("=" * 60)
    
    if len(critical_issues) > 0:
        print("   🔴 SISTEMA NÃO ESTÁ EM CONFORMIDADE FISCAL")
        print(f"   ⚠️  {len(critical_issues)} problemas críticos precisam ser corrigidos")
    elif len(high_issues) > 0:
        print("   🟡 SISTEMA PARCIALMENTE CONFORME")
        print(f"   ⚠️  {len(high_issues)} problemas altos precisam ser corrigidos")
    else:
        print("   ✅ SISTEMA ESTÁ EM CONFORMIDADE FISCAL")
    
    print(f"   📊 Total de problemas: {len(all_issues)}")
    print(f"   🔍 Campos fiscais identificados: {len(tax_fields_found)}")
    print(f"   📈 Score de compliance: {max(0, 100 - len(all_issues) * 10)}%")
    
    return {
        'tax_fields_found': len(tax_fields_found),
        'critical_issues': len(critical_issues),
        'high_issues': len(high_issues),
        'medium_issues': len(medium_issues),
        'compliance_score': max(0, 100 - len(all_issues) * 10),
        'recommendations': recommendations,
        'all_issues': all_issues
    }


if __name__ == "__main__":
    print("🚀 INICIANDO DIAGNÓSTICO FISCAL...")
    print("🎯 Mestres do Café Enterprise - Análise de Impostos")
    print("=" * 60)
    
    try:
        result = analyze_tax_system()
        
        print(f"\n✅ DIAGNÓSTICO CONCLUÍDO")
        print(f"🎯 Score final: {result['compliance_score']}%")
        
        if result['critical_issues'] > 0:
            print("🔴 AÇÃO IMEDIATA NECESSÁRIA - Problemas críticos encontrados")
        elif result['high_issues'] > 0:
            print("🟡 AÇÃO RECOMENDADA - Melhorias importantes necessárias")
        else:
            print("✅ SISTEMA EM CONFORMIDADE - Manutenção preventiva recomendada")
            
    except Exception as e:
        print(f"❌ ERRO NO DIAGNÓSTICO: {str(e)}")
        logger.exception("Erro durante análise fiscal")