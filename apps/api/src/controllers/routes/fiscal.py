from flask import Blueprint, request, jsonify
from src.models.database import db, Order, User, Product, OrderItem
import uuid
from datetime import datetime
import json

fiscal_bp = Blueprint('fiscal', __name__)

# Simulação de emissão fiscal
class FiscalService:
    @staticmethod
    def generate_nfe(order_id):
        """Gera NFe para um pedido"""
        order = Order.query.get(order_id)
        if not order:
            return None
        
        # Gerar número da NFe (em produção seria integração com SEFAZ)
        nfe_number = f"NFe{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4().hex[:8]).upper()}"
        
        # Calcular impostos
        subtotal = float(order.total_amount)
        icms = subtotal * 0.18  # 18% ICMS
        pis = subtotal * 0.0165  # 1.65% PIS
        cofins = subtotal * 0.076  # 7.6% COFINS
        total_taxes = icms + pis + cofins
        total_with_taxes = subtotal + total_taxes
        
        nfe_data = {
            'nfe_number': nfe_number,
            'order_id': order_id,
            'customer': {
                'name': order.user.name,
                'email': order.user.email,
                'cpf_cnpj': '123.456.789-00',  # Em produção viria do cadastro
                'address': order.shipping_address
            },
            'items': [{
                'product_name': item.product.name,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price),
                'ncm': '09011100',  # Código NCM do café
                'cfop': '5102'  # CFOP para venda
            } for item in order.items],
            'totals': {
                'subtotal': subtotal,
                'icms': icms,
                'pis': pis,
                'cofins': cofins,
                'total_taxes': total_taxes,
                'total': total_with_taxes
            },
            'emission_date': datetime.now().isoformat(),
            'status': 'emitted'
        }
        
        return nfe_data
    
    @staticmethod
    def generate_nfse(order_id):
        """Gera NFSe para serviços"""
        order = Order.query.get(order_id)
        if not order:
            return None
        
        # Gerar número da NFSe
        nfse_number = f"NFSe{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4().hex[:8]).upper()}"
        
        # Calcular impostos para serviços
        subtotal = float(order.total_amount)
        iss = subtotal * 0.05  # 5% ISS
        total_with_taxes = subtotal + iss
        
        nfse_data = {
            'nfse_number': nfse_number,
            'order_id': order_id,
            'customer': {
                'name': order.user.name,
                'email': order.user.email,
                'cpf_cnpj': '123.456.789-00'
            },
            'service_description': 'Venda de café especial',
            'totals': {
                'subtotal': subtotal,
                'iss': iss,
                'total': total_with_taxes
            },
            'emission_date': datetime.now().isoformat(),
            'status': 'emitted'
        }
        
        return nfse_data

@fiscal_bp.route('/nfe/<order_id>', methods=['POST'])
def generate_nfe(order_id):
    """Gera NFe para um pedido"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        if order.payment_status != 'paid':
            return jsonify({'error': 'Pedido deve estar pago para gerar NFe'}), 400
        
        # Gerar NFe
        nfe_data = FiscalService.generate_nfe(order_id)
        if not nfe_data:
            return jsonify({'error': 'Erro ao gerar NFe'}), 500
        
        # Em produção, aqui seria salvo no banco e enviado para SEFAZ
        return jsonify({
            'message': 'NFe gerada com sucesso',
            'nfe': nfe_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@fiscal_bp.route('/nfse/<order_id>', methods=['POST'])
def generate_nfse(order_id):
    """Gera NFSe para um pedido"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        if order.payment_status != 'paid':
            return jsonify({'error': 'Pedido deve estar pago para gerar NFSe'}), 400
        
        # Gerar NFSe
        nfse_data = FiscalService.generate_nfse(order_id)
        if not nfse_data:
            return jsonify({'error': 'Erro ao gerar NFSe'}), 500
        
        return jsonify({
            'message': 'NFSe gerada com sucesso',
            'nfse': nfse_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@fiscal_bp.route('/nfe/<nfe_number>', methods=['GET'])
def get_nfe(nfe_number):
    """Busca NFe por número"""
    try:
        # Em produção, buscar no banco de dados
        # Por enquanto, simular busca
        if not nfe_number.startswith('NFe'):
            return jsonify({'error': 'Número de NFe inválido'}), 400
        
        # Simular dados da NFe
        nfe_data = {
            'nfe_number': nfe_number,
            'status': 'emitted',
            'emission_date': datetime.now().isoformat(),
            'xml_url': f'/api/fiscal/nfe/{nfe_number}/xml',
            'pdf_url': f'/api/fiscal/nfe/{nfe_number}/pdf'
        }
        
        return jsonify({'nfe': nfe_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@fiscal_bp.route('/nfe/<nfe_number>/xml', methods=['GET'])
def get_nfe_xml(nfe_number):
    """Retorna XML da NFe"""
    try:
        # Em produção, gerar XML real
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe{nfe_number}">
      <ide>
        <cUF>35</cUF>
        <cNF>{nfe_number[-8:]}</cNF>
        <natOp>Venda de café especial</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>{nfe_number[-8:]}</nNF>
        <dhEmi>{datetime.now().isoformat()}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>1</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>Mestres do Café v2.0</verProc>
      </ide>
      <dest>
        <CNPJ>12345678000199</CNPJ>
        <xNome>Cliente Exemplo</xNome>
        <enderDest>
          <xLgr>Rua Exemplo</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234-567</CEP>
          <cPais>1058</cPais>
        </enderDest>
      </dest>
      <det>
        <prod>
          <cProd>001</cProd>
          <xProd>Café Especial</xProd>
          <NCM>09011100</NCM>
          <CFOP>5102</CFOP>
          <uCom>KG</uCom>
          <qCom>1.000</qCom>
          <vUnCom>50.00</vUnCom>
          <vProd>50.00</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>50.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>9.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>50.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>0.83</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>50.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>3.80</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>50.00</vBC>
          <vICMS>9.00</vICMS>
          <vProd>50.00</vProd>
          <vNF>63.63</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>9</modFrete>
      </transp>
      <cobr>
        <fat>
          <nFat>FAT{nfe_number[-8:]}</nFat>
          <vOrig>50.00</vOrig>
          <vDesc>0.00</vDesc>
          <vLiq>63.63</vLiq>
        </fat>
        <dup>
          <nDup>001</nDup>
          <dVenc>{datetime.now().strftime('%Y-%m-%d')}</dVenc>
          <vDup>63.63</vDup>
        </dup>
      </cobr>
    </infNFe>
  </NFe>
</nfeProc>"""
        
        return xml_content, 200, {'Content-Type': 'application/xml'}
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@fiscal_bp.route('/nfe/<nfe_number>/pdf', methods=['GET'])
def get_nfe_pdf(nfe_number):
    """Retorna PDF da NFe"""
    try:
        # Em produção, gerar PDF real
        # Por enquanto, retornar mensagem
        return jsonify({
            'message': 'PDF da NFe gerado com sucesso',
            'nfe_number': nfe_number,
            'pdf_url': f'/api/fiscal/nfe/{nfe_number}/download'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@fiscal_bp.route('/reports/sales', methods=['GET'])
def get_sales_report():
    """Relatório de vendas para fins fiscais"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Em produção, buscar dados reais do banco
        # Por enquanto, simular relatório
        report_data = {
            'period': {
                'start_date': start_date or '2025-01-01',
                'end_date': end_date or datetime.now().strftime('%Y-%m-%d')
            },
            'summary': {
                'total_sales': 15000.00,
                'total_taxes': 2700.00,
                'total_nfe_emitted': 45,
                'total_nfse_emitted': 12
            },
            'taxes_breakdown': {
                'icms': 1800.00,
                'pis': 165.00,
                'cofins': 760.00,
                'iss': 375.00
            }
        }
        
        return jsonify({'report': report_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@fiscal_bp.route('/config', methods=['GET'])
def get_fiscal_config():
    """Configurações fiscais da empresa"""
    return jsonify({
        'company': {
            'name': 'Mestres do Café Ltda',
            'cnpj': '12.345.678/0001-99',
            'ie': '123.456.789.012',
            'address': {
                'street': 'Rua dos Cafés, 123',
                'neighborhood': 'Centro',
                'city': 'São Paulo',
                'state': 'SP',
                'cep': '01234-567'
            }
        },
        'fiscal_settings': {
            'regime_tributario': 'Simples Nacional',
            'cnae': '47.29-4-01',
            'ambiente': 'homologacao',  # homologacao, producao
            'certificate_expiry': '2025-12-31'
        }
    }) 