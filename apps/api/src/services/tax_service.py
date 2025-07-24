"""
Serviço de Cálculo de Impostos Brasileiro
Implementa compliance fiscal completa para e-commerce usando bibliotecas gratuitas
"""
import json
import logging
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

# Bibliotecas para validação fiscal brasileira
try:
    from validate_docbr import CPF, CNPJ
    from cpf_cnpj import cpf, cnpj
    VALIDATION_LIBS_AVAILABLE = True
except ImportError:
    VALIDATION_LIBS_AVAILABLE = False

from src.models.customers import Customer
from src.models.orders import Order, OrderItem
from src.models.products import Product
from src.models.tax import (
    CFOPCode,
    ICMSRate,
    NCMCode,
    ProductTax,
    TaxCalculation,
    TaxExemption
)

logger = logging.getLogger(__name__)


class BrazilianTaxCalculator:
    """
    Calculadora de impostos brasileiros com suporte a todas as legislações
    """
    
    # Tabela de alíquotas ICMS padrão (pode ser substituída por dados do banco)
    ICMS_RATES = {
        # Vendas dentro do mesmo estado (alíquotas internas)
        ('SP', 'SP'): Decimal('18.00'),
        ('RJ', 'RJ'): Decimal('20.00'),
        ('MG', 'MG'): Decimal('18.00'),
        ('RS', 'RS'): Decimal('17.00'),
        ('PR', 'PR'): Decimal('19.00'),
        ('SC', 'SC'): Decimal('17.00'),
        
        # Vendas interestaduais (alíquotas interestaduais)
        'INTERESTADUAL': Decimal('12.00'),  # Padrão para vendas interestaduais
        'DIFAL_CONTRIB': Decimal('4.00'),   # DIFAL para contribuintes
        'DIFAL_NAO_CONTRIB': Decimal('4.00')  # DIFAL para não contribuintes
    }
    
    # Alíquotas padrão PIS/COFINS
    PIS_RATE_DEFAULT = Decimal('1.65')
    COFINS_RATE_DEFAULT = Decimal('7.60')
    
    # NCM codes comuns para café
    COFFEE_NCM_CODES = {
        '09011100': {
            'description': 'Café não torrado, não descafeinado',
            'ipi_rate': Decimal('0.00'),
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60')
        },
        '09011200': {
            'description': 'Café não torrado, descafeinado',
            'ipi_rate': Decimal('0.00'),
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60')
        },
        '09012100': {
            'description': 'Café torrado, não descafeinado',
            'ipi_rate': Decimal('0.00'),
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60')
        }
    }


class TaxCalculationService:
    """
    Serviço completo de cálculo de impostos brasileiros
    Implementa ICMS, PIS, COFINS, IPI conforme legislação com bibliotecas gratuitas
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.calculator = BrazilianTaxCalculator()
        self.cpf_validator = CPF() if VALIDATION_LIBS_AVAILABLE else None
        self.cnpj_validator = CNPJ() if VALIDATION_LIBS_AVAILABLE else None
        
    def calculate_order_taxes(
        self,
        order: Order,
        origin_state: str = "SP",
        destination_state: Optional[str] = None,
        destination_city: Optional[str] = None
    ) -> Dict:
        """
        Calcula todos os impostos de um pedido
        """
        try:
            # Obter informações do cliente
            customer = None
            if order.customer_id:
                customer = self.db.query(Customer).filter(
                    Customer.id == order.customer_id
                ).first()
                
                # Usar estado do cliente se não especificado
                if not destination_state and customer:
                    destination_state = self._extract_customer_state(customer)
                else:
                    destination_state = destination_state or "SP"
            
            # Calcular impostos por item
            total_taxes = Decimal('0')
            order_calculations = []
            
            for item in order.items:
                item_calc = self.calculate_item_taxes(
                    item=item,
                    customer=customer,
                    origin_state=origin_state,
                    destination_state=destination_state
                )
                if item_calc:
                    order_calculations.append(item_calc)
                    total_taxes += item_calc.total_tax_amount
            
            # Atualizar total do pedido
            order.tax_amount = total_taxes
            order.total_amount = (order.subtotal + order.shipping_cost + 
                                 total_taxes)
            
            self.db.commit()
            
            return {
                'success': True,
                'total_taxes': float(total_taxes),
                'calculations': [calc.to_dict() for calc in order_calculations],
                'order_total': float(order.total_amount),
                'compliance_status': self._validate_compliance(order_calculations)
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular impostos do pedido: {e}")
            self.db.rollback()
            return {
                'success': False,
                'error': str(e),
                'total_taxes': 0
            }
    
    def calculate_item_taxes(
        self,
        item: OrderItem,
        customer: Optional[Customer] = None,
        origin_state: str = "SP",
        destination_state: str = "SP"
    ) -> Optional[TaxCalculation]:
        """
        Calcula impostos de um item específico
        """
        try:
            # Obter produto
            product = self.db.query(Product).filter(
                Product.id == item.product_id
            ).first()
            
            if not product:
                raise ValueError(f"Produto {item.product_id} não encontrado")
            
            # Obter configuração fiscal do produto
            product_tax = self.db.query(ProductTax).filter(
                ProductTax.product_id == product.id,
                ProductTax.is_active == True
            ).first()
            
            if not product_tax:
                # Criar configuração padrão se não existir
                product_tax = self._create_default_product_tax(product)
            
            # Determinar CFOP
            cfop_code = self._determine_cfop(
                origin_state, destination_state, customer
            )
            
            # Verificar isenções do cliente
            customer_exemptions = []
            if customer:
                customer_exemptions = self._get_customer_exemptions(
                    customer, destination_state
                )
            
            # Valor base para cálculo
            base_value = item.price * item.quantity
            
            # Criar cálculo de impostos
            calculation = TaxCalculation(
                order_item_id=item.id,
                product_id=product.id,
                customer_id=customer.id if customer else None,
                base_value=item.price,
                quantity=item.quantity,
                total_value=base_value,
                origin_state=origin_state,
                destination_state=destination_state,
                cfop_code=cfop_code,
                calculated_at=datetime.utcnow()
            )
            
            # Calcular cada imposto
            self._calculate_icms(
                calculation, product_tax, base_value, 
                origin_state, destination_state, customer_exemptions
            )
            self._calculate_pis(
                calculation, product_tax, base_value, customer_exemptions
            )
            self._calculate_cofins(
                calculation, product_tax, base_value, customer_exemptions
            )
            self._calculate_ipi(
                calculation, product_tax, base_value, customer_exemptions
            )
            
            # Total de impostos
            calculation.total_tax_amount = (
                calculation.icms_amount + calculation.pis_amount +
                calculation.cofins_amount + calculation.ipi_amount
            )
            
            # Metadados do cálculo
            calculation.calculation_data = json.dumps({
                'product_name': product.name,
                'product_sku': product.sku,
                'ncm_code': (product_tax.ncm.code 
                            if product_tax.ncm else None),
                'cfop_code': cfop_code,
                'customer_type': (customer.customer_type 
                                 if customer else 'individual'),
                'exemptions_applied': [ex.tax_type for ex in customer_exemptions],
                'calculation_method': 'brazilian_tax_libs',
                'timestamp': calculation.calculated_at.isoformat()
            })
            
            self.db.add(calculation)
            self.db.flush()
            
            return calculation
            
        except Exception as e:
            logger.error(f"Erro no cálculo de impostos do item {item.id}: {e}")
            return None
    
    def _calculate_icms(
        self,
        calculation: TaxCalculation,
        product_tax: ProductTax,
        base_value: Decimal,
        origin_state: str,
        destination_state: str,
        exemptions: List[TaxExemption]
    ):
        """Calcula ICMS baseado nas regras brasileiras"""
        # Verificar isenção
        icms_exemption = next(
            (ex for ex in exemptions if ex.tax_type == 'icms'), None
        )
        if icms_exemption and icms_exemption.exemption_type == 'total':
            calculation.icms_situation = "40"  # Isenta
            calculation.icms_rate = Decimal('0')
            calculation.icms_amount = Decimal('0')
            return
        
        # Obter alíquota ICMS
        icms_rate = self._get_icms_rate(origin_state, destination_state)
        
        if icms_exemption and icms_exemption.exemption_type == 'reduced_rate':
            icms_rate = icms_exemption.reduced_rate or Decimal('0.00')
        
        # Base de cálculo ICMS
        calculation.icms_base = base_value
        
        # Aplicar redução de base se configurada
        if product_tax.icms_reduced_base:
            reduction_factor = (
                (Decimal('100') - product_tax.icms_reduced_base) / 
                Decimal('100')
            )
            calculation.icms_base = (
                calculation.icms_base * reduction_factor
            ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            calculation.icms_situation = "20"  # Com redução de base
        else:
            calculation.icms_situation = product_tax.icms_situation or "00"
        
        calculation.icms_rate = icms_rate
        calculation.icms_amount = (
            calculation.icms_base * icms_rate / Decimal('100')
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _calculate_pis(
        self,
        calculation: TaxCalculation,
        product_tax: ProductTax,
        base_value: Decimal,
        exemptions: List[TaxExemption]
    ):
        """Calcula PIS"""
        # Verificar isenção
        pis_exemption = next(
            (ex for ex in exemptions if ex.tax_type == 'pis'), None
        )
        if pis_exemption and pis_exemption.exemption_type == 'total':
            calculation.pis_situation = "07"  # Operação isenta
            calculation.pis_rate = Decimal('0')
            calculation.pis_amount = Decimal('0')
            return
        
        # Alíquota PIS
        pis_rate = (product_tax.pis_rate or 
                   (product_tax.ncm.pis_rate if product_tax.ncm else None) or
                   self.calculator.PIS_RATE_DEFAULT)
        
        if pis_exemption and pis_exemption.exemption_type == 'reduced_rate':
            pis_rate = pis_exemption.reduced_rate or Decimal('0.00')
        
        calculation.pis_base = base_value
        calculation.pis_rate = pis_rate
        calculation.pis_situation = product_tax.pis_situation or "01"
        calculation.pis_amount = (
            calculation.pis_base * pis_rate / Decimal('100')
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _calculate_cofins(
        self,
        calculation: TaxCalculation,
        product_tax: ProductTax,
        base_value: Decimal,
        exemptions: List[TaxExemption]
    ):
        """Calcula COFINS"""
        # Verificar isenção
        cofins_exemption = next(
            (ex for ex in exemptions if ex.tax_type == 'cofins'), None
        )
        if cofins_exemption and cofins_exemption.exemption_type == 'total':
            calculation.cofins_situation = "07"  # Operação isenta
            calculation.cofins_rate = Decimal('0')
            calculation.cofins_amount = Decimal('0')
            return
        
        # Alíquota COFINS
        cofins_rate = (
            product_tax.cofins_rate or 
            (product_tax.ncm.cofins_rate if product_tax.ncm else None) or
            self.calculator.COFINS_RATE_DEFAULT
        )
        
        if (cofins_exemption and 
            cofins_exemption.exemption_type == 'reduced_rate'):
            cofins_rate = cofins_exemption.reduced_rate or Decimal('0.00')
        
        calculation.cofins_base = base_value
        calculation.cofins_rate = cofins_rate
        calculation.cofins_situation = product_tax.cofins_situation or "01"
        calculation.cofins_amount = (
            calculation.cofins_base * cofins_rate / Decimal('100')
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _calculate_ipi(
        self,
        calculation: TaxCalculation,
        product_tax: ProductTax,
        base_value: Decimal,
        exemptions: List[TaxExemption]
    ):
        """Calcula IPI (se aplicável)"""
        # IPI só se aplica a produtos industrializados
        ipi_rate = (product_tax.ipi_rate or 
                   (product_tax.ncm.ipi_rate if product_tax.ncm else None))
        
        if not ipi_rate or ipi_rate <= 0:
            calculation.ipi_situation = "53"  # Não tributado
            calculation.ipi_rate = Decimal('0')
            calculation.ipi_amount = Decimal('0')
            return
        
        # Verificar isenção
        ipi_exemption = next(
            (ex for ex in exemptions if ex.tax_type == 'ipi'), None
        )
        if ipi_exemption and ipi_exemption.exemption_type == 'total':
            calculation.ipi_situation = "02"  # Isenta
            calculation.ipi_rate = Decimal('0')
            calculation.ipi_amount = Decimal('0')
            return
        
        if ipi_exemption and ipi_exemption.exemption_type == 'reduced_rate':
            ipi_rate = ipi_exemption.reduced_rate or Decimal('0.00')
        
        calculation.ipi_base = base_value
        calculation.ipi_rate = ipi_rate
        calculation.ipi_situation = product_tax.ipi_situation or "00"
        calculation.ipi_amount = (
            calculation.ipi_base * ipi_rate / Decimal('100')
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _get_icms_rate(
        self, 
        origin_state: str, 
        destination_state: str
    ) -> Decimal:
        """Obtém alíquota ICMS baseada nos estados"""
        # Buscar alíquota na tabela ICMS
        icms_rate_obj = self.db.query(ICMSRate).filter(
            ICMSRate.origin_state == origin_state,
            ICMSRate.destination_state == destination_state,
            ICMSRate.is_active == True
        ).first()
        
        if icms_rate_obj:
            return icms_rate_obj.rate
        
        # Usar alíquotas padrão da calculadora
        state_pair = (origin_state, destination_state)
        if state_pair in self.calculator.ICMS_RATES:
            return self.calculator.ICMS_RATES[state_pair]
        
        # Alíquota padrão baseada na operação
        if origin_state == destination_state:
            return Decimal('18.00')  # Interna padrão
        else:
            return Decimal('12.00')  # Interestadual padrão
    
    def _determine_cfop(
        self,
        origin_state: str,
        destination_state: str,
        customer: Optional[Customer]
    ) -> str:
        """Determina CFOP baseado na operação"""
        # Venda para consumidor final
        if origin_state == destination_state:
            cfop_code = "5102"  # Venda interna
        else:
            cfop_code = "6102"  # Venda interestadual
        
        return cfop_code
    
    def _get_customer_exemptions(
        self,
        customer: Customer,
        destination_state: str
    ) -> List[TaxExemption]:
        """Obtém isenções fiscais do cliente"""
        exemptions = self.db.query(TaxExemption).filter(
            TaxExemption.customer_id == customer.id,
            TaxExemption.is_active == True,
            TaxExemption.valid_from <= func.now(),
            (TaxExemption.valid_until.is_(None) | 
             (TaxExemption.valid_until >= func.now()))
        ).all()
        
        # Filtrar por estados aplicáveis
        applicable_exemptions = []
        for exemption in exemptions:
            if exemption.applicable_states:
                try:
                    states = json.loads(exemption.applicable_states)
                    if destination_state in states:
                        applicable_exemptions.append(exemption)
                except (json.JSONDecodeError, TypeError):
                    applicable_exemptions.append(exemption)
            else:
                applicable_exemptions.append(exemption)
        
        return applicable_exemptions
    
    def _extract_customer_state(self, customer: Customer) -> str:
        """Extrai estado do endereço do cliente"""
        try:
            if customer.address:
                address_data = json.loads(customer.address)
                return address_data.get("state", "SP")
        except (json.JSONDecodeError, KeyError):
            pass
        return "SP"  # Padrão SP
    
    def _create_default_product_tax(self, product: Product) -> ProductTax:
        """Cria configuração fiscal padrão para produtos"""
        # Buscar ou criar NCM padrão para café
        default_ncm_code = "09011100"  # Café não torrado, não descafeinado
        default_ncm = self.db.query(NCMCode).filter(
            NCMCode.code == default_ncm_code
        ).first()
        
        if not default_ncm:
            ncm_data = self.calculator.COFFEE_NCM_CODES[default_ncm_code]
            default_ncm = NCMCode(
                code=default_ncm_code,
                description=ncm_data['description'],
                unit="KG",
                ipi_rate=ncm_data['ipi_rate'],
                pis_rate=ncm_data['pis_rate'],
                cofins_rate=ncm_data['cofins_rate']
            )
            self.db.add(default_ncm)
            self.db.flush()
        
        product_tax = ProductTax(
            product_id=product.id,
            ncm_id=default_ncm.id,
            tax_origin="0",  # Nacional
            icms_situation="00",  # Tributada integralmente
            pis_situation="01",   # Operação tributável
            cofins_situation="01"  # Operação tributável
        )
        
        self.db.add(product_tax)
        self.db.flush()
        
        logger.warning(
            f"Criada configuração fiscal padrão para produto {product.id}"
        )
        return product_tax
    
    def _validate_compliance(
        self, 
        calculations: List[TaxCalculation]
    ) -> Dict:
        """Valida compliance fiscal dos cálculos"""
        compliance_score = 0
        total_checks = 0
        issues = []
        
        for calc in calculations:
            total_checks += 4  # ICMS, PIS, COFINS, IPI
            
            # Verificar se ICMS foi calculado
            if calc.icms_amount > 0 or calc.icms_situation in ["40", "41"]:
                compliance_score += 1
            else:
                issues.append(f"ICMS não calculado para item {calc.order_item_id}")
            
            # Verificar PIS
            if calc.pis_amount > 0 or calc.pis_situation in ["07", "08"]:
                compliance_score += 1
            else:
                issues.append(f"PIS não calculado para item {calc.order_item_id}")
            
            # Verificar COFINS
            if calc.cofins_amount > 0 or calc.cofins_situation in ["07", "08"]:
                compliance_score += 1
            else:
                issues.append(f"COFINS não calculado para item {calc.order_item_id}")
            
            # Verificar IPI (se aplicável)
            if (calc.ipi_amount > 0 or 
                calc.ipi_situation in ["02", "03", "53"]):
                compliance_score += 1
            else:
                issues.append(f"IPI não verificado para item {calc.order_item_id}")
        
        score_percentage = (
            (compliance_score / total_checks * 100) if total_checks > 0 else 0
        )
        
        return {
            'score': round(score_percentage, 2),
            'status': 'compliant' if score_percentage >= 90 else 'issues_found',
            'issues': issues[:5],  # Limitar a 5 issues principais
            'total_calculations': len(calculations)
        }

    def validate_cpf_cnpj(self, document: str) -> Dict:
        """Valida CPF ou CNPJ usando bibliotecas"""
        if not VALIDATION_LIBS_AVAILABLE:
            return {'valid': False, 'error': 'Bibliotecas de validação não disponíveis'}
        
        try:
            document = ''.join(filter(str.isdigit, document))
            
            if len(document) == 11:
                # CPF
                is_valid = self.cpf_validator.validate(document)
                return {
                    'valid': is_valid,
                    'type': 'cpf',
                    'formatted': cpf.format(document) if is_valid else document
                }
            elif len(document) == 14:
                # CNPJ
                is_valid = self.cnpj_validator.validate(document)
                return {
                    'valid': is_valid,
                    'type': 'cnpj',
                    'formatted': cnpj.format(document) if is_valid else document
                }
            else:
                return {'valid': False, 'error': 'Documento deve ter 11 ou 14 dígitos'}
                
        except Exception as e:
            return {'valid': False, 'error': f'Erro na validação: {str(e)}'}