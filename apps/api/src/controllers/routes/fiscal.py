"""
Rotas da API Fiscal - NF-e, NFC-e e Operações SEFAZ

Este módulo implementa todos os endpoints para:
- Emissão de documentos fiscais (NF-e, NFC-e)
- Cancelamento e Carta de Correção
- Inutilização de numeração
- Consultas SEFAZ
- Gestão de empresas emissoras
- Gestão de certificados digitais
- Gestão de contadores

Conformidade: SEFAZ Nacional, MOC v7.0
"""

import uuid
import base64
import logging
from datetime import datetime, date
from decimal import Decimal
from functools import wraps

from flask import Blueprint, request, jsonify, send_file, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db

logger = logging.getLogger(__name__)

fiscal_bp = Blueprint('fiscal', __name__, url_prefix='/api/fiscal')


# =============================================================================
# DECORADORES E HELPERS
# =============================================================================

def fiscal_admin_required(f):
    """Decorator que requer permissão de admin fiscal"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        # TODO: Verificar se usuário tem permissão fiscal
        return f(*args, **kwargs)
    return decorated_function


def handle_fiscal_error(f):
    """Decorator para tratamento de erros fiscais"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Erro fiscal: {str(e)}")
            return jsonify({
                'sucesso': False,
                'erro': str(e),
                'codigo': 'ERRO_FISCAL'
            }), 500
    return decorated_function


# =============================================================================
# ROTAS DE EMPRESA EMISSORA
# =============================================================================

@fiscal_bp.route('/empresa', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def listar_empresas():
    """Lista todas as empresas emissoras"""
    from models.fiscal import EmpresaEmissora

    empresas = EmpresaEmissora.query.filter_by(is_active=True).all()

    return jsonify({
        'sucesso': True,
        'empresas': [e.to_dict() for e in empresas],
        'total': len(empresas)
    })


@fiscal_bp.route('/empresa', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def criar_empresa():
    """
    Cria uma nova empresa emissora

    Body:
    {
        "razao_social": "EMPRESA LTDA",
        "nome_fantasia": "EMPRESA",
        "cnpj": "12345678000190",
        "inscricao_estadual": "123456789012",
        "regime_tributario": "3",
        "cnae_principal": "4711301",
        "logradouro": "RUA EXEMPLO",
        "numero": "100",
        "bairro": "CENTRO",
        "cep": "01000000",
        "municipio": "SAO PAULO",
        "codigo_municipio_ibge": "3550308",
        "uf": "SP",
        "codigo_uf_ibge": "35"
    }
    """
    from models.fiscal import EmpresaEmissora

    data = request.get_json()

    # Validações básicas
    campos_obrigatorios = [
        'razao_social', 'cnpj', 'regime_tributario', 'cnae_principal',
        'logradouro', 'numero', 'bairro', 'cep', 'municipio',
        'codigo_municipio_ibge', 'uf', 'codigo_uf_ibge'
    ]

    erros = []
    for campo in campos_obrigatorios:
        if not data.get(campo):
            erros.append(f"Campo obrigatório: {campo}")

    if erros:
        return jsonify({
            'sucesso': False,
            'erros': erros
        }), 400

    # Verifica se CNPJ já existe
    cnpj = data['cnpj'].replace('.', '').replace('/', '').replace('-', '')
    if EmpresaEmissora.query.filter_by(cnpj=cnpj).first():
        return jsonify({
            'sucesso': False,
            'erro': 'CNPJ já cadastrado'
        }), 400

    empresa = EmpresaEmissora(
        razao_social=data['razao_social'],
        nome_fantasia=data.get('nome_fantasia'),
        cnpj=cnpj,
        inscricao_estadual=data.get('inscricao_estadual'),
        inscricao_municipal=data.get('inscricao_municipal'),
        regime_tributario=data['regime_tributario'],
        cnae_principal=data['cnae_principal'],
        cnae_secundarios=data.get('cnae_secundarios'),
        logradouro=data['logradouro'],
        numero=data['numero'],
        complemento=data.get('complemento'),
        bairro=data['bairro'],
        cep=data['cep'].replace('-', ''),
        municipio=data['municipio'],
        codigo_municipio_ibge=data['codigo_municipio_ibge'],
        uf=data['uf'],
        codigo_uf_ibge=data['codigo_uf_ibge'],
        telefone_principal=data.get('telefone'),
        email_fiscal=data.get('email'),
        ambiente_atual=data.get('ambiente', '2'),  # Default homologação
        criado_por=get_jwt_identity()
    )

    db.session.add(empresa)
    db.session.commit()

    return jsonify({
        'sucesso': True,
        'mensagem': 'Empresa criada com sucesso',
        'empresa': empresa.to_dict()
    }), 201


@fiscal_bp.route('/empresa/<empresa_id>', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def obter_empresa(empresa_id):
    """Obtém detalhes de uma empresa"""
    from models.fiscal import EmpresaEmissora

    empresa = EmpresaEmissora.query.get_or_404(empresa_id)

    return jsonify({
        'sucesso': True,
        'empresa': empresa.to_dict(include_sensitive=True)
    })


@fiscal_bp.route('/empresa/<empresa_id>', methods=['PUT'])
@fiscal_admin_required
@handle_fiscal_error
def atualizar_empresa(empresa_id):
    """Atualiza dados de uma empresa"""
    from models.fiscal import EmpresaEmissora

    empresa = EmpresaEmissora.query.get_or_404(empresa_id)
    data = request.get_json()

    # Campos atualizáveis
    campos_atualizaveis = [
        'razao_social', 'nome_fantasia', 'inscricao_estadual', 'inscricao_municipal',
        'regime_tributario', 'cnae_principal', 'logradouro', 'numero', 'complemento',
        'bairro', 'cep', 'municipio', 'codigo_municipio_ibge', 'uf', 'telefone_principal',
        'email_fiscal', 'ambiente_atual', 'token_csc_homologacao', 'id_token_csc_homologacao',
        'token_csc_producao', 'id_token_csc_producao'
    ]

    for campo in campos_atualizaveis:
        if campo in data:
            setattr(empresa, campo, data[campo])

    empresa.atualizado_por = get_jwt_identity()
    db.session.commit()

    return jsonify({
        'sucesso': True,
        'mensagem': 'Empresa atualizada',
        'empresa': empresa.to_dict()
    })


# =============================================================================
# ROTAS DE CONTADOR
# =============================================================================

@fiscal_bp.route('/contador', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def criar_contador():
    """
    Cadastra contador responsável

    Body:
    {
        "empresa_id": "uuid",
        "nome_completo": "CONTADOR SILVA",
        "tipo_pessoa": "PF",
        "cpf": "12345678901",
        "crc": "SP-123456",
        "crc_uf": "SP",
        "email_principal": "contador@email.com",
        "telefone": "11999999999"
    }
    """
    from models.fiscal import ContadorResponsavel

    data = request.get_json()

    contador = ContadorResponsavel(
        empresa_id=data['empresa_id'],
        nome_completo=data['nome_completo'],
        tipo_pessoa=data['tipo_pessoa'],
        cpf=data.get('cpf'),
        cnpj=data.get('cnpj'),
        crc=data['crc'],
        crc_uf=data['crc_uf'],
        email_principal=data['email_principal'],
        telefone=data.get('telefone'),
        receber_xml_automatico=data.get('receber_xml', True),
        receber_danfe_automatico=data.get('receber_danfe', True)
    )

    db.session.add(contador)
    db.session.commit()

    return jsonify({
        'sucesso': True,
        'mensagem': 'Contador cadastrado',
        'contador': contador.to_dict()
    }), 201


@fiscal_bp.route('/contador/<empresa_id>', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def listar_contadores(empresa_id):
    """Lista contadores de uma empresa"""
    from models.fiscal import ContadorResponsavel

    contadores = ContadorResponsavel.query.filter_by(
        empresa_id=empresa_id,
        is_active=True
    ).all()

    return jsonify({
        'sucesso': True,
        'contadores': [c.to_dict() for c in contadores]
    })


# =============================================================================
# ROTAS DE CERTIFICADO DIGITAL
# =============================================================================

@fiscal_bp.route('/certificado', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def upload_certificado():
    """
    Upload de certificado digital A1

    Form data:
    - empresa_id: UUID da empresa
    - certificado: Arquivo PFX/P12
    - senha: Senha do certificado
    """
    from models.fiscal import CertificadoDigital
    from services.certificate_service import get_certificate_manager

    empresa_id = request.form.get('empresa_id')
    senha = request.form.get('senha')

    if 'certificado' not in request.files:
        return jsonify({
            'sucesso': False,
            'erro': 'Arquivo do certificado não enviado'
        }), 400

    arquivo = request.files['certificado']
    pfx_data = arquivo.read()

    # Carrega e valida certificado
    cert_manager = get_certificate_manager()
    sucesso, info = cert_manager.registrar_certificado(empresa_id, pfx_data, senha)

    if not sucesso:
        return jsonify({
            'sucesso': False,
            'erro': info.erro
        }), 400

    # Salva no banco
    certificado = CertificadoDigital(
        empresa_id=empresa_id,
        tipo='A1',
        nome_descritivo=f"Certificado {info.subject_cn}",
        serial_number=info.serial_number,
        thumbprint=info.thumbprint,
        subject_cn=info.subject_cn,
        subject_dn=info.subject_dn,
        issuer_cn=info.issuer_cn,
        issuer_dn=info.issuer_dn,
        valido_de=info.valido_de,
        valido_ate=info.valido_ate,
        certificado_pfx=pfx_data,  # TODO: Criptografar
        status='ativo',
        is_default=True
    )

    db.session.add(certificado)
    db.session.commit()

    return jsonify({
        'sucesso': True,
        'mensagem': 'Certificado cadastrado com sucesso',
        'certificado': certificado.to_dict(),
        'dias_para_expiracao': info.valido_ate and (info.valido_ate - datetime.utcnow()).days
    }), 201


@fiscal_bp.route('/certificado/<empresa_id>', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def listar_certificados(empresa_id):
    """Lista certificados de uma empresa"""
    from models.fiscal import CertificadoDigital

    certificados = CertificadoDigital.query.filter_by(
        empresa_id=empresa_id
    ).order_by(CertificadoDigital.valido_ate.desc()).all()

    return jsonify({
        'sucesso': True,
        'certificados': [c.to_dict() for c in certificados]
    })


@fiscal_bp.route('/certificado/<certificado_id>/validar', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def validar_certificado(certificado_id):
    """Valida um certificado (verifica expiração e revogação)"""
    from models.fiscal import CertificadoDigital

    certificado = CertificadoDigital.query.get_or_404(certificado_id)

    # Verifica validade
    now = datetime.utcnow()
    if now > certificado.valido_ate:
        certificado.status = 'expirado'
        db.session.commit()
        return jsonify({
            'sucesso': False,
            'status': 'expirado',
            'mensagem': 'Certificado expirado'
        })

    # TODO: Verificar OCSP

    return jsonify({
        'sucesso': True,
        'status': 'valido',
        'dias_para_expiracao': (certificado.valido_ate - now).days
    })


# =============================================================================
# ROTAS DE EMISSÃO DE DOCUMENTOS
# =============================================================================

@fiscal_bp.route('/nfe/emitir', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def emitir_nfe():
    """
    Emite uma NF-e

    Body:
    {
        "empresa_id": "uuid",
        "destinatario": {
            "tipo_pessoa": "PJ",
            "cnpj": "12345678000190",
            "nome": "EMPRESA DESTINO",
            "ie": "123456789012",
            "endereco": {...}
        },
        "itens": [
            {
                "codigo": "PROD001",
                "descricao": "Produto Teste",
                "ncm": "09012100",
                "cfop": "5102",
                "unidade": "UN",
                "quantidade": 2,
                "valor_unitario": 49.90
            }
        ],
        "pagamentos": [
            {"forma": "01", "valor": 99.80}
        ]
    }
    """
    from services.fiscal_service import get_fiscal_service, DadosEmissao

    data = request.get_json()

    # Monta dados de emissão
    dados = DadosEmissao(
        empresa_id=data['empresa_id'],
        modelo="55",
        tipo_operacao=data.get('tipo_operacao', '1'),
        finalidade=data.get('finalidade', '1'),
        indicador_presenca=data.get('indicador_presenca', '9'),
        itens=data.get('itens', []),
        pagamentos=data.get('pagamentos', [])
    )

    # Destinatário
    dest = data.get('destinatario', {})
    dados.dest_tipo_pessoa = dest.get('tipo_pessoa')
    dados.dest_cpf = dest.get('cpf')
    dados.dest_cnpj = dest.get('cnpj')
    dados.dest_nome = dest.get('nome')
    dados.dest_email = dest.get('email')
    dados.dest_ie = dest.get('ie')

    # Endereço
    endereco = dest.get('endereco', {})
    dados.dest_logradouro = endereco.get('logradouro')
    dados.dest_numero = endereco.get('numero')
    dados.dest_complemento = endereco.get('complemento')
    dados.dest_bairro = endereco.get('bairro')
    dados.dest_cep = endereco.get('cep')
    dados.dest_municipio = endereco.get('municipio')
    dados.dest_codigo_municipio = endereco.get('codigo_municipio')
    dados.dest_uf = endereco.get('uf')

    # Informações adicionais
    dados.informacoes_complementares = data.get('informacoes_complementares')
    dados.order_id = data.get('order_id')

    # Emite
    fiscal_service = get_fiscal_service()
    resultado = fiscal_service.emitir_nfe(dados)

    status_code = 201 if resultado.sucesso else 400

    return jsonify(resultado.to_dict()), status_code


@fiscal_bp.route('/nfce/emitir', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def emitir_nfce():
    """
    Emite uma NFC-e (Cupom Fiscal)

    Body similar ao /nfe/emitir, mas destinatário é opcional
    """
    from services.fiscal_service import get_fiscal_service, DadosEmissao

    data = request.get_json()

    dados = DadosEmissao(
        empresa_id=data['empresa_id'],
        modelo="65",
        tipo_operacao="1",
        indicador_presenca="1",  # Presencial
        itens=data.get('itens', []),
        pagamentos=data.get('pagamentos', [])
    )

    # Destinatário (opcional para NFC-e)
    dest = data.get('destinatario', {})
    if dest:
        dados.dest_tipo_pessoa = dest.get('tipo_pessoa')
        dados.dest_cpf = dest.get('cpf')
        dados.dest_nome = dest.get('nome')
        dados.dest_email = dest.get('email')

    dados.sale_id = data.get('sale_id')

    fiscal_service = get_fiscal_service()
    resultado = fiscal_service.emitir_nfce(dados)

    status_code = 201 if resultado.sucesso else 400

    return jsonify(resultado.to_dict()), status_code


@fiscal_bp.route('/documento/<documento_id>/cancelar', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def cancelar_documento(documento_id):
    """
    Cancela um documento fiscal

    Body:
    {
        "justificativa": "Cancelamento solicitado pelo cliente"
    }
    """
    from services.fiscal_service import get_fiscal_service

    data = request.get_json()
    justificativa = data.get('justificativa', '')

    if len(justificativa) < 15:
        return jsonify({
            'sucesso': False,
            'erro': 'Justificativa deve ter pelo menos 15 caracteres'
        }), 400

    fiscal_service = get_fiscal_service()
    resultado = fiscal_service.cancelar_documento(documento_id, justificativa)

    status_code = 200 if resultado.sucesso else 400

    return jsonify(resultado.to_dict()), status_code


@fiscal_bp.route('/documento/<documento_id>/corrigir', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def carta_correcao(documento_id):
    """
    Emite Carta de Correção

    Body:
    {
        "texto_correcao": "Correção do endereço de entrega..."
    }
    """
    from services.fiscal_service import get_fiscal_service

    data = request.get_json()
    texto = data.get('texto_correcao', '')

    if len(texto) < 15 or len(texto) > 1000:
        return jsonify({
            'sucesso': False,
            'erro': 'Texto deve ter entre 15 e 1000 caracteres'
        }), 400

    fiscal_service = get_fiscal_service()
    resultado = fiscal_service.carta_correcao(documento_id, texto)

    status_code = 200 if resultado.sucesso else 400

    return jsonify(resultado.to_dict()), status_code


# =============================================================================
# ROTAS DE CONSULTA
# =============================================================================

@fiscal_bp.route('/documento/<documento_id>', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def obter_documento(documento_id):
    """Obtém detalhes de um documento fiscal"""
    from models.fiscal import DocumentoFiscal

    doc = DocumentoFiscal.query.get_or_404(documento_id)

    return jsonify({
        'sucesso': True,
        'documento': doc.to_dict(include_xml=True)
    })


@fiscal_bp.route('/documento/<documento_id>/xml', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def download_xml(documento_id):
    """Download do XML autorizado"""
    from models.fiscal import DocumentoFiscal

    doc = DocumentoFiscal.query.get_or_404(documento_id)

    if not doc.xml_protocolo:
        return jsonify({
            'sucesso': False,
            'erro': 'XML não disponível'
        }), 404

    return Response(
        doc.xml_protocolo,
        mimetype='application/xml',
        headers={
            'Content-Disposition': f'attachment; filename=NFe{doc.chave_acesso}.xml'
        }
    )


@fiscal_bp.route('/documento/<documento_id>/danfe', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def download_danfe(documento_id):
    """Download do DANFE em PDF"""
    from models.fiscal import DocumentoFiscal

    doc = DocumentoFiscal.query.get_or_404(documento_id)

    if not doc.danfe_pdf:
        # TODO: Gerar DANFE sob demanda
        return jsonify({
            'sucesso': False,
            'erro': 'DANFE não disponível'
        }), 404

    return Response(
        doc.danfe_pdf,
        mimetype='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename=DANFE_{doc.chave_acesso}.pdf'
        }
    )


@fiscal_bp.route('/consultar/<chave_acesso>', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def consultar_sefaz(chave_acesso):
    """Consulta situação de NF-e na SEFAZ"""
    from services.fiscal_service import get_fiscal_service

    if len(chave_acesso) != 44:
        return jsonify({
            'sucesso': False,
            'erro': 'Chave de acesso inválida'
        }), 400

    fiscal_service = get_fiscal_service()
    resultado = fiscal_service.consultar_documento(chave_acesso)

    return jsonify(resultado.to_dict())


@fiscal_bp.route('/sefaz/status', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def status_sefaz():
    """Consulta status do serviço SEFAZ"""
    from services.sefaz_service import SefazServiceFactory

    uf = request.args.get('uf', 'SP')
    ambiente = request.args.get('ambiente', '2')

    sefaz = SefazServiceFactory.criar_servico(uf=uf, ambiente=ambiente)
    resultado = sefaz.status_servico()

    return jsonify({
        'sucesso': resultado.sucesso,
        'status': 'online' if resultado.sucesso else 'offline',
        'codigo': resultado.codigo_status,
        'mensagem': resultado.motivo,
        'tempo_resposta_ms': resultado.tempo_resposta_ms
    })


# =============================================================================
# ROTAS DE INUTILIZAÇÃO
# =============================================================================

@fiscal_bp.route('/numeracao/inutilizar', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def inutilizar_numeracao():
    """
    Inutiliza faixa de numeração

    Body:
    {
        "empresa_id": "uuid",
        "modelo": "55",
        "serie": 1,
        "numero_inicial": 100,
        "numero_final": 105,
        "justificativa": "Numeração pulada por erro de sistema"
    }
    """
    from models.fiscal import EmpresaEmissora, InutilizacaoNumeracao
    from services.sefaz_service import SefazServiceFactory
    from services.nfe_xml_builder import NFeInutilizacaoBuilder
    from services.certificate_service import get_certificate_manager

    data = request.get_json()

    empresa = EmpresaEmissora.query.get_or_404(data['empresa_id'])

    justificativa = data.get('justificativa', '')
    if len(justificativa) < 15:
        return jsonify({
            'sucesso': False,
            'erro': 'Justificativa deve ter pelo menos 15 caracteres'
        }), 400

    # Gera XML
    builder = NFeInutilizacaoBuilder()
    xml_inut = builder.build_inutilizacao(
        empresa=empresa,
        modelo=data['modelo'],
        serie=data['serie'],
        ano=datetime.now().year,
        numero_inicial=data['numero_inicial'],
        numero_final=data['numero_final'],
        justificativa=justificativa,
        ambiente=empresa.ambiente_atual
    )

    # Assina
    cert_manager = get_certificate_manager()
    resultado_assinatura = cert_manager.assinar_xml_empresa(
        str(empresa.id), xml_inut, tipo="inutilizacao"
    )

    if not resultado_assinatura.sucesso:
        return jsonify({
            'sucesso': False,
            'erro': resultado_assinatura.erro
        }), 400

    # Envia para SEFAZ
    sefaz = SefazServiceFactory.criar_servico(
        uf=empresa.uf,
        ambiente=empresa.ambiente_atual
    )

    resultado = sefaz.inutilizar_numeracao(resultado_assinatura.xml_assinado)

    # Registra
    inut = InutilizacaoNumeracao(
        empresa_id=empresa.id,
        modelo=data['modelo'],
        serie=data['serie'],
        ambiente=empresa.ambiente_atual,
        ano=datetime.now().year,
        numero_inicial=data['numero_inicial'],
        numero_final=data['numero_final'],
        justificativa=justificativa,
        protocolo=resultado.protocolo,
        codigo_status=resultado.codigo_status,
        motivo=resultado.motivo,
        xml_envio=resultado_assinatura.xml_assinado,
        xml_retorno=resultado.xml_retorno,
        status='autorizado' if resultado.sucesso else 'rejeitado',
        criado_por=get_jwt_identity()
    )

    db.session.add(inut)
    db.session.commit()

    status_code = 200 if resultado.sucesso else 400

    return jsonify({
        'sucesso': resultado.sucesso,
        'protocolo': resultado.protocolo,
        'mensagem': resultado.motivo
    }), status_code


# =============================================================================
# ROTAS DE SÉRIES FISCAIS
# =============================================================================

@fiscal_bp.route('/serie/<empresa_id>', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def listar_series(empresa_id):
    """Lista séries fiscais de uma empresa"""
    from models.fiscal import SerieFiscal

    series = SerieFiscal.query.filter_by(empresa_id=empresa_id).all()

    return jsonify({
        'sucesso': True,
        'series': [s.to_dict() for s in series]
    })


@fiscal_bp.route('/serie', methods=['POST'])
@fiscal_admin_required
@handle_fiscal_error
def criar_serie():
    """
    Cria uma nova série fiscal

    Body:
    {
        "empresa_id": "uuid",
        "modelo": "55",
        "serie": 2,
        "ambiente": "2",
        "descricao": "Série para vendas online"
    }
    """
    from models.fiscal import SerieFiscal

    data = request.get_json()

    serie = SerieFiscal(
        empresa_id=data['empresa_id'],
        modelo=data['modelo'],
        serie=data['serie'],
        ambiente=data['ambiente'],
        descricao=data.get('descricao'),
        is_default=data.get('is_default', False)
    )

    db.session.add(serie)
    db.session.commit()

    return jsonify({
        'sucesso': True,
        'serie': serie.to_dict()
    }), 201


# =============================================================================
# ROTAS DE NCM E CFOP
# =============================================================================

@fiscal_bp.route('/ncm', methods=['GET'])
@jwt_required()
@handle_fiscal_error
def listar_ncm():
    """Lista códigos NCM"""
    from models.tax import NCMCode

    busca = request.args.get('q', '')
    limit = int(request.args.get('limit', 50))

    query = NCMCode.query.filter_by(is_active=True)

    if busca:
        query = query.filter(
            (NCMCode.code.ilike(f'%{busca}%')) |
            (NCMCode.description.ilike(f'%{busca}%'))
        )

    ncms = query.limit(limit).all()

    return jsonify({
        'sucesso': True,
        'ncms': [n.to_dict() for n in ncms]
    })


@fiscal_bp.route('/cfop', methods=['GET'])
@jwt_required()
@handle_fiscal_error
def listar_cfop():
    """Lista códigos CFOP"""
    from models.tax import CFOPCode

    tipo = request.args.get('tipo')  # entrada, saida
    operacao = request.args.get('operacao')  # interna, interestadual

    query = CFOPCode.query.filter_by(is_active=True)

    cfops = query.all()

    return jsonify({
        'sucesso': True,
        'cfops': [c.to_dict() for c in cfops]
    })


# =============================================================================
# ROTAS DE RELATÓRIOS
# =============================================================================

@fiscal_bp.route('/relatorio/documentos', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def relatorio_documentos():
    """
    Relatório de documentos fiscais emitidos

    Query params:
    - empresa_id: UUID
    - data_inicio: YYYY-MM-DD
    - data_fim: YYYY-MM-DD
    - modelo: 55, 65
    - status: autorizado, cancelado
    """
    from models.fiscal import DocumentoFiscal
    from sqlalchemy import func

    empresa_id = request.args.get('empresa_id')
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    modelo = request.args.get('modelo')
    status = request.args.get('status')

    query = DocumentoFiscal.query

    if empresa_id:
        query = query.filter_by(empresa_id=empresa_id)
    if modelo:
        query = query.filter_by(modelo=modelo)
    if status:
        query = query.filter_by(status=status)
    if data_inicio:
        query = query.filter(DocumentoFiscal.data_emissao >= data_inicio)
    if data_fim:
        query = query.filter(DocumentoFiscal.data_emissao <= data_fim)

    # Totais
    totais = db.session.query(
        func.count(DocumentoFiscal.id).label('total_documentos'),
        func.sum(DocumentoFiscal.valor_total).label('valor_total'),
        func.sum(DocumentoFiscal.valor_icms).label('total_icms'),
        func.sum(DocumentoFiscal.valor_pis).label('total_pis'),
        func.sum(DocumentoFiscal.valor_cofins).label('total_cofins')
    ).filter(query.whereclause).first()

    documentos = query.order_by(DocumentoFiscal.data_emissao.desc()).limit(100).all()

    return jsonify({
        'sucesso': True,
        'totais': {
            'total_documentos': totais.total_documentos or 0,
            'valor_total': float(totais.valor_total or 0),
            'total_icms': float(totais.total_icms or 0),
            'total_pis': float(totais.total_pis or 0),
            'total_cofins': float(totais.total_cofins or 0)
        },
        'documentos': [d.to_dict() for d in documentos]
    })


@fiscal_bp.route('/relatorio/auditoria', methods=['GET'])
@fiscal_admin_required
@handle_fiscal_error
def relatorio_auditoria():
    """Relatório de auditoria fiscal"""
    from models.fiscal import AuditoriaFiscal

    empresa_id = request.args.get('empresa_id')
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    operacao = request.args.get('operacao')

    query = AuditoriaFiscal.query

    if operacao:
        query = query.filter_by(operacao=operacao)
    if data_inicio:
        query = query.filter(AuditoriaFiscal.data_hora >= data_inicio)
    if data_fim:
        query = query.filter(AuditoriaFiscal.data_hora <= data_fim)

    auditorias = query.order_by(AuditoriaFiscal.data_hora.desc()).limit(200).all()

    return jsonify({
        'sucesso': True,
        'registros': [a.to_dict() for a in auditorias]
    })
