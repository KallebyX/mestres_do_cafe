"""
Script para popular dados fiscais iniciais
Configura NCM, ICMS, CFOP para e-commerce de café brasileiro
"""
import logging
from decimal import Decimal
from database import db
from models.tax import NCMCode, ICMSRate, CFOPCode
from app import create_app

logger = logging.getLogger(__name__)


def populate_ncm_codes():
    """Popula códigos NCM para produtos de café"""
    ncm_data = [
        {
            'code': '09011100',
            'description': 'Café não torrado, não descafeinado',
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60'),
            'ipi_rate': Decimal('0.00'),
            'is_active': True
        },
        {
            'code': '09012100',
            'description': 'Café torrado, não descafeinado',
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60'),
            'ipi_rate': Decimal('0.00'),
            'is_active': True
        },
        {
            'code': '09012200',
            'description': 'Café torrado, descafeinado',
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60'),
            'ipi_rate': Decimal('0.00'),
            'is_active': True
        },
        {
            'code': '21011100',
            'description': 'Extratos, essências e concentrados de café',
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60'),
            'ipi_rate': Decimal('0.00'),
            'is_active': True
        },
        {
            'code': '21012000',
            'description': 'Preparações à base de extratos de café',
            'pis_rate': Decimal('1.65'),
            'cofins_rate': Decimal('7.60'),
            'ipi_rate': Decimal('0.00'),
            'is_active': True
        }
    ]
    
    for ncm_info in ncm_data:
        try:
            ncm = NCMCode(
                code=ncm_info['code'],
                description=ncm_info['description'],
                pis_rate=ncm_info['pis_rate'],
                cofins_rate=ncm_info['cofins_rate'],
                ipi_rate=ncm_info['ipi_rate'],
                is_active=ncm_info['is_active']
            )
            db.session.add(ncm)
            logger.info(f"✅ NCM {ncm_info['code']} criado")
        except Exception as e:
            logger.info(f"⚠️ NCM {ncm_info['code']} já existe")


def populate_icms_rates():
    """Popula taxas ICMS para transações interestaduais"""
    icms_data = [
        # São Paulo interno (venda dentro do estado)
        {'origin_state': 'SP', 'destination_state': 'SP',
         'rate': Decimal('18.00')},
        
        # São Paulo para outros estados (interestadual)
        {'origin_state': 'SP', 'destination_state': 'RJ',
         'rate': Decimal('12.00')},
        {'origin_state': 'SP', 'destination_state': 'MG',
         'rate': Decimal('12.00')},
        {'origin_state': 'SP', 'destination_state': 'RS',
         'rate': Decimal('12.00')},
        {'origin_state': 'SP', 'destination_state': 'PR',
         'rate': Decimal('12.00')},
        {'origin_state': 'SP', 'destination_state': 'SC',
         'rate': Decimal('12.00')},
        {'origin_state': 'SP', 'destination_state': 'BA',
         'rate': Decimal('7.00')},  # Norte/Nordeste
        {'origin_state': 'SP', 'destination_state': 'CE',
         'rate': Decimal('7.00')},
        {'origin_state': 'SP', 'destination_state': 'PE',
         'rate': Decimal('7.00')},
        
        # Outros estados - vendas internas
        {'origin_state': 'RJ', 'destination_state': 'RJ',
         'rate': Decimal('20.00')},
        {'origin_state': 'MG', 'destination_state': 'MG',
         'rate': Decimal('18.00')},
        {'origin_state': 'RS', 'destination_state': 'RS',
         'rate': Decimal('17.00')},
        {'origin_state': 'PR', 'destination_state': 'PR',
         'rate': Decimal('19.00')},
        {'origin_state': 'SC', 'destination_state': 'SC',
         'rate': Decimal('17.00')},
    ]
    
    for rate_data in icms_data:
        try:
            rate = ICMSRate(
                origin_state=rate_data['origin_state'],
                destination_state=rate_data['destination_state'],
                rate=rate_data['rate'],
                is_active=True,
                description=(f"ICMS {rate_data['origin_state']} -> "
                           f"{rate_data['destination_state']}")
            )
            db.session.add(rate)
            logger.info(f"✅ ICMS {rate_data['origin_state']}->"
                       f"{rate_data['destination_state']} criado")
        except Exception as e:
            logger.info(f"⚠️ ICMS {rate_data['origin_state']}->"
                       f"{rate_data['destination_state']} já existe")


def populate_cfop_codes():
    """Popula códigos CFOP principais para vendas de café"""
    cfop_data = [
        {
            'code': '5102',
            'description': ('Venda de mercadoria adquirida ou recebida '
                           'de terceiros - Operação interna'),
            'operation_type': 'sale',
            'movement_type': 'output',
            'is_active': True
        },
        {
            'code': '6102',
            'description': ('Venda de mercadoria adquirida ou recebida '
                           'de terceiros - Operação interestadual'),
            'operation_type': 'sale',
            'movement_type': 'output',
            'is_active': True
        },
        {
            'code': '5101',
            'description': ('Venda de produção do estabelecimento - '
                           'Operação interna'),
            'operation_type': 'sale',
            'movement_type': 'output',
            'is_active': True
        },
        {
            'code': '6101',
            'description': ('Venda de produção do estabelecimento - '
                           'Operação interestadual'),
            'operation_type': 'sale',
            'movement_type': 'output',
            'is_active': True
        },
        {
            'code': '5405',
            'description': 'Venda de mercadoria para consumidor final',
            'operation_type': 'sale',
            'movement_type': 'output',
            'is_active': True
        }
    ]
    
    for cfop_info in cfop_data:
        try:
            cfop = CFOPCode(
                code=cfop_info['code'],
                description=cfop_info['description'],
                operation_type=cfop_info['operation_type'],
                movement_type=cfop_info['movement_type'],
                is_active=cfop_info['is_active']
            )
            db.session.add(cfop)
            logger.info(f"✅ CFOP {cfop_info['code']} criado")
        except Exception as e:
            logger.info(f"⚠️ CFOP {cfop_info['code']} já existe")


def populate_all_tax_data():
    """Popula todos os dados fiscais básicos"""
    try:
        logger.info("🚀 Iniciando população de dados fiscais...")
        
        # Popula cada tipo de dados
        populate_ncm_codes()
        populate_icms_rates()
        populate_cfop_codes()
        
        # Commit das mudanças
        db.session.commit()
        logger.info("✅ Todos os dados fiscais populados com sucesso!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao popular dados fiscais: {e}")
        db.session.rollback()
        return False


if __name__ == '__main__':
    # Configurar logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Criar contexto Flask
    app = create_app()
    
    with app.app_context():
        # Criar tabelas se não existirem
        try:
            db.create_all()
            logger.info("✅ Tabelas criadas/verificadas com sucesso!")
        except Exception as e:
            logger.error(f"❌ Erro ao criar tabelas: {e}")
            
        # Executar população
        success = populate_all_tax_data()
        if success:
            print("✅ Script de população executado com sucesso!")
        else:
            print("❌ Erro na execução do script de população!")