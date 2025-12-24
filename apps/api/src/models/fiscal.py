"""
Modelos Fiscais Completos - Sistema PDV Fiscal Brasileiro
Conformidade total com SEFAZ, NF-e, NFC-e, NFS-e, CF-e-SAT

Este módulo implementa toda a estrutura de dados necessária para:
- Emissão de documentos fiscais eletrônicos
- Comunicação com SEFAZ
- Gestão de certificados digitais ICP-Brasil
- Controle de numeração fiscal
- Armazenamento legal de documentos
- Auditoria e compliance

Referências Legais:
- Manual de Orientação do Contribuinte (MOC) - versão 7.0
- Nota Técnica 2019.001 - Leiaute NF-e/NFC-e
- Ajuste SINIEF 07/05 - Instituição da NF-e
- Ato COTEPE/ICMS 09/13 - Especificações Técnicas
"""

import uuid
import json
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, Date,
    ForeignKey, CheckConstraint, Index, UniqueConstraint, LargeBinary
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


# =============================================================================
# ENUMERAÇÕES FISCAIS OFICIAIS
# =============================================================================

class RegimeTributario(Enum):
    """Regime tributário conforme Art. 3º LC 123/2006 e legislação vigente"""
    SIMPLES_NACIONAL = "1"  # Simples Nacional
    SIMPLES_NACIONAL_EXCESSO = "2"  # Simples Nacional - Excesso de sublimite de receita bruta
    REGIME_NORMAL_LUCRO_PRESUMIDO = "3"  # Regime Normal - Lucro Presumido
    REGIME_NORMAL_LUCRO_REAL = "4"  # Regime Normal - Lucro Real
    MEI = "5"  # Microempreendedor Individual


class AmbienteFiscal(Enum):
    """Ambiente de operação SEFAZ - Tag <tpAmb>"""
    PRODUCAO = "1"
    HOMOLOGACAO = "2"


class TipoEmissao(Enum):
    """Tipo de emissão - Tag <tpEmis>"""
    NORMAL = "1"  # Emissão normal
    CONTINGENCIA_FS_IA = "2"  # Contingência FS-IA
    CONTINGENCIA_SCAN = "3"  # Contingência SCAN (desativado)
    CONTINGENCIA_EPEC = "4"  # Contingência EPEC
    CONTINGENCIA_FS_DA = "5"  # Contingência FS-DA
    CONTINGENCIA_SVC_AN = "6"  # Contingência SVC-AN
    CONTINGENCIA_SVC_RS = "7"  # Contingência SVC-RS
    CONTINGENCIA_OFFLINE = "9"  # Contingência off-line NFC-e


class ModeloDocumentoFiscal(Enum):
    """Modelos de documentos fiscais eletrônicos"""
    NFE = "55"  # Nota Fiscal Eletrônica
    NFCE = "65"  # Nota Fiscal de Consumidor Eletrônica
    NFSE = "99"  # Nota Fiscal de Serviços Eletrônica (municipal)
    CFE_SAT = "59"  # Cupom Fiscal Eletrônico (SAT)
    CTE = "57"  # Conhecimento de Transporte Eletrônico
    MDFE = "58"  # Manifesto Eletrônico de Documentos Fiscais


class StatusDocumentoFiscal(Enum):
    """Status do documento fiscal no ciclo de vida"""
    RASCUNHO = "rascunho"
    ASSINADO = "assinado"
    ENVIADO = "enviado"
    AUTORIZADO = "autorizado"
    REJEITADO = "rejeitado"
    DENEGADO = "denegado"
    CANCELADO = "cancelado"
    INUTILIZADO = "inutilizado"
    CONTINGENCIA = "contingencia"


class FinalidadeNFe(Enum):
    """Finalidade de emissão - Tag <finNFe>"""
    NORMAL = "1"
    COMPLEMENTAR = "2"
    AJUSTE = "3"
    DEVOLUCAO = "4"


class TipoOperacao(Enum):
    """Tipo de operação - Tag <tpNF>"""
    ENTRADA = "0"
    SAIDA = "1"


class IndicadorPresenca(Enum):
    """Indicador de presença do comprador - Tag <indPres>"""
    NAO_SE_APLICA = "0"
    PRESENCIAL = "1"
    INTERNET = "2"
    TELEMARKETING = "3"
    NFCE_ENTREGA_DOMICILIO = "4"
    PRESENCIAL_FORA_ESTABELECIMENTO = "5"
    OUTROS = "9"


class FormasPagamento(Enum):
    """Formas de pagamento - Tag <tPag>"""
    DINHEIRO = "01"
    CHEQUE = "02"
    CARTAO_CREDITO = "03"
    CARTAO_DEBITO = "04"
    CREDITO_LOJA = "05"
    VALE_ALIMENTACAO = "10"
    VALE_REFEICAO = "11"
    VALE_PRESENTE = "12"
    VALE_COMBUSTIVEL = "13"
    DUPLICATA_MERCANTIL = "14"
    BOLETO_BANCARIO = "15"
    DEPOSITO_BANCARIO = "16"
    PIX = "17"
    TRANSFERENCIA_BANCARIA = "18"
    PROGRAMA_FIDELIDADE = "19"
    SEM_PAGAMENTO = "90"
    OUTROS = "99"


class TipoCertificado(Enum):
    """Tipos de certificado digital ICP-Brasil"""
    A1 = "A1"  # Arquivo (PFX/P12)
    A3 = "A3"  # Token/Cartão
    HSM = "HSM"  # Hardware Security Module (Cloud)


class StatusCertificado(Enum):
    """Status do certificado digital"""
    ATIVO = "ativo"
    EXPIRADO = "expirado"
    REVOGADO = "revogado"
    PENDENTE = "pendente"


# =============================================================================
# MODELO: EMPRESA EMISSORA (ISSUER)
# =============================================================================

class EmpresaEmissora(db.Model):
    """
    Cadastro completo da empresa emissora de documentos fiscais

    Conforme exigências SEFAZ para emissão de NF-e/NFC-e:
    - Manual de Orientação do Contribuinte (MOC)
    - Ajuste SINIEF 07/05
    - Nota Técnica 2019.001
    """
    __tablename__ = 'empresas_emissoras'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Identificação empresarial
    razao_social = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255))
    cnpj = Column(String(14), unique=True, nullable=False)  # Sem pontuação
    inscricao_estadual = Column(String(20))  # IE
    inscricao_municipal = Column(String(20))  # IM
    inscricao_suframa = Column(String(20))  # SUFRAMA (Zona Franca de Manaus)

    # Classificação CNAE
    cnae_principal = Column(String(7), nullable=False)  # 7 dígitos
    cnae_secundarios = Column(JSONB)  # Lista de CNAEs secundários

    # Regime tributário
    regime_tributario = Column(String(1), nullable=False)  # 1, 2, 3, 4 ou 5

    # Endereço fiscal completo
    logradouro = Column(String(255), nullable=False)
    numero = Column(String(60), nullable=False)
    complemento = Column(String(255))
    bairro = Column(String(100), nullable=False)
    cep = Column(String(8), nullable=False)  # Sem pontuação
    municipio = Column(String(255), nullable=False)
    codigo_municipio_ibge = Column(String(7), nullable=False)  # Código IBGE 7 dígitos
    uf = Column(String(2), nullable=False)
    codigo_uf_ibge = Column(String(2), nullable=False)  # Código UF IBGE
    pais = Column(String(100), default='BRASIL')
    codigo_pais = Column(String(4), default='1058')  # Brasil = 1058

    # Contatos fiscais
    telefone_principal = Column(String(20))
    telefone_secundario = Column(String(20))
    email_fiscal = Column(String(255))
    email_contabilidade = Column(String(255))

    # Configurações de ambiente
    ambiente_atual = Column(String(1), default="2")  # 1=Produção, 2=Homologação

    # Configurações NF-e
    serie_nfe_padrao = Column(Integer, default=1)
    proxima_numeracao_nfe = Column(Integer, default=1)

    # Configurações NFC-e
    serie_nfce_padrao = Column(Integer, default=1)
    proxima_numeracao_nfce = Column(Integer, default=1)
    token_csc_homologacao = Column(String(50))  # Código de Segurança do Contribuinte
    id_token_csc_homologacao = Column(String(10))
    token_csc_producao = Column(String(50))
    id_token_csc_producao = Column(String(10))

    # Configurações NFS-e (variam por município)
    codigo_servico_municipal = Column(String(20))
    aliquota_iss_padrao = Column(Numeric(5, 2))

    # Logo e informações visuais
    logo_url = Column(String(500))
    informacoes_complementares = Column(Text)  # Informações adicionais padrão

    # Status e controle
    is_active = Column(Boolean, default=True)
    data_inicio_atividades = Column(Date)
    data_cadastro = Column(DateTime(timezone=True), default=datetime.utcnow)
    data_atualizacao = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Auditoria
    criado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    atualizado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    certificados = relationship('CertificadoDigital', back_populates='empresa')
    contadores = relationship('ContadorResponsavel', back_populates='empresa')
    series_fiscais = relationship('SerieFiscal', back_populates='empresa')
    documentos_fiscais = relationship('DocumentoFiscal', back_populates='empresa')

    __table_args__ = (
        CheckConstraint(
            "regime_tributario IN ('1', '2', '3', '4', '5')",
            name='check_regime_tributario'
        ),
        CheckConstraint(
            "ambiente_atual IN ('1', '2')",
            name='check_ambiente_fiscal'
        ),
        CheckConstraint(
            "LENGTH(cnpj) = 14",
            name='check_cnpj_length'
        ),
        CheckConstraint(
            "LENGTH(codigo_municipio_ibge) = 7",
            name='check_codigo_municipio_ibge'
        ),
        Index('idx_empresa_cnpj', 'cnpj'),
        Index('idx_empresa_uf', 'uf'),
    )

    def __repr__(self):
        return f'<EmpresaEmissora {self.razao_social} - CNPJ: {self.cnpj}>'

    def get_cnpj_formatado(self):
        """Retorna CNPJ formatado XX.XXX.XXX/XXXX-XX"""
        if self.cnpj and len(self.cnpj) == 14:
            return f"{self.cnpj[:2]}.{self.cnpj[2:5]}.{self.cnpj[5:8]}/{self.cnpj[8:12]}-{self.cnpj[12:14]}"
        return self.cnpj

    def to_dict(self, include_sensitive=False):
        result = {
            'id': str(self.id),
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'cnpj': self.get_cnpj_formatado(),
            'inscricao_estadual': self.inscricao_estadual,
            'inscricao_municipal': self.inscricao_municipal,
            'cnae_principal': self.cnae_principal,
            'regime_tributario': self.regime_tributario,
            'endereco': {
                'logradouro': self.logradouro,
                'numero': self.numero,
                'complemento': self.complemento,
                'bairro': self.bairro,
                'cep': self.cep,
                'municipio': self.municipio,
                'codigo_municipio_ibge': self.codigo_municipio_ibge,
                'uf': self.uf
            },
            'contato': {
                'telefone_principal': self.telefone_principal,
                'email_fiscal': self.email_fiscal
            },
            'ambiente_atual': self.ambiente_atual,
            'is_active': self.is_active
        }

        if include_sensitive:
            result['series'] = {
                'serie_nfe_padrao': self.serie_nfe_padrao,
                'proxima_numeracao_nfe': self.proxima_numeracao_nfe,
                'serie_nfce_padrao': self.serie_nfce_padrao,
                'proxima_numeracao_nfce': self.proxima_numeracao_nfce
            }

        return result


# =============================================================================
# MODELO: CONTADOR RESPONSÁVEL
# =============================================================================

class ContadorResponsavel(db.Model):
    """
    Cadastro do contador responsável pela empresa

    Obrigatório para:
    - Recebimento automático de documentos fiscais
    - Responsabilidade técnica perante SEFAZ
    - Integração com sistemas contábeis
    """
    __tablename__ = 'contadores_responsaveis'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)

    # Dados pessoais/empresariais
    nome_completo = Column(String(255), nullable=False)
    tipo_pessoa = Column(String(2), nullable=False)  # PF ou PJ
    cpf = Column(String(11))  # Para pessoa física
    cnpj = Column(String(14))  # Para escritório contábil

    # Registro profissional
    crc = Column(String(20), nullable=False)  # Número do CRC
    crc_uf = Column(String(2), nullable=False)  # UF do CRC
    crc_tipo = Column(String(20))  # Original, Provisório, Secundário
    crc_validade = Column(Date)  # Data de validade do registro

    # Contato
    email_principal = Column(String(255), nullable=False)
    email_secundario = Column(String(255))
    telefone = Column(String(20))
    telefone_celular = Column(String(20))

    # Endereço profissional
    logradouro = Column(String(255))
    numero = Column(String(60))
    complemento = Column(String(255))
    bairro = Column(String(100))
    cep = Column(String(8))
    municipio = Column(String(255))
    uf = Column(String(2))

    # Configurações de envio de documentos
    receber_xml_automatico = Column(Boolean, default=True)
    receber_danfe_automatico = Column(Boolean, default=True)
    receber_resumo_diario = Column(Boolean, default=False)
    receber_resumo_mensal = Column(Boolean, default=True)
    formato_preferido = Column(String(10), default='PDF')  # PDF, XML, ambos

    # Status
    is_active = Column(Boolean, default=True)
    data_inicio_responsabilidade = Column(Date, default=date.today)
    data_fim_responsabilidade = Column(Date)

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    atualizado_em = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    empresa = relationship('EmpresaEmissora', back_populates='contadores')

    __table_args__ = (
        CheckConstraint(
            "tipo_pessoa IN ('PF', 'PJ')",
            name='check_tipo_pessoa_contador'
        ),
        CheckConstraint(
            "(tipo_pessoa = 'PF' AND cpf IS NOT NULL) OR (tipo_pessoa = 'PJ' AND cnpj IS NOT NULL)",
            name='check_documento_contador'
        ),
        Index('idx_contador_crc', 'crc', 'crc_uf'),
        Index('idx_contador_empresa', 'empresa_id'),
    )

    def __repr__(self):
        return f'<ContadorResponsavel {self.nome_completo} - CRC: {self.crc}/{self.crc_uf}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'nome_completo': self.nome_completo,
            'tipo_pessoa': self.tipo_pessoa,
            'cpf': self.cpf,
            'cnpj': self.cnpj,
            'crc': self.crc,
            'crc_uf': self.crc_uf,
            'email_principal': self.email_principal,
            'telefone': self.telefone,
            'is_active': self.is_active
        }


# =============================================================================
# MODELO: CERTIFICADO DIGITAL ICP-BRASIL
# =============================================================================

class CertificadoDigital(db.Model):
    """
    Gestão de certificados digitais ICP-Brasil

    Suporta:
    - Certificado A1 (arquivo PFX/P12)
    - Certificado A3 (token/cartão)
    - HSM (Hardware Security Module - Cloud)

    Requisitos de segurança:
    - Senha criptografada
    - Validação de cadeia ICP-Brasil
    - Verificação de revogação (OCSP/CRL)
    """
    __tablename__ = 'certificados_digitais'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)

    # Identificação do certificado
    tipo = Column(String(3), nullable=False)  # A1, A3, HSM
    nome_descritivo = Column(String(255))  # Nome para identificação

    # Dados do certificado
    serial_number = Column(String(100), unique=True)  # Número serial
    thumbprint = Column(String(64))  # Hash do certificado (SHA-256)
    subject_cn = Column(String(255))  # Common Name do subject
    subject_dn = Column(Text)  # Distinguished Name completo
    issuer_cn = Column(String(255))  # Common Name do emissor
    issuer_dn = Column(Text)  # Distinguished Name do emissor

    # Validade
    valido_de = Column(DateTime(timezone=True), nullable=False)
    valido_ate = Column(DateTime(timezone=True), nullable=False)

    # Armazenamento para A1 (CRIPTOGRAFADO)
    certificado_pfx = Column(LargeBinary)  # Arquivo .pfx/.p12 criptografado
    senha_hash = Column(String(255))  # Hash da senha (bcrypt)
    senha_criptografada = Column(LargeBinary)  # Senha criptografada (AES-256)

    # Armazenamento para A3
    driver_path = Column(String(500))  # Caminho do driver do token
    slot_id = Column(Integer)  # ID do slot do token
    token_label = Column(String(100))  # Label do token

    # Armazenamento para HSM
    hsm_provider = Column(String(100))  # Provedor HSM (AWS CloudHSM, Azure Key Vault, etc.)
    hsm_key_id = Column(String(255))  # ID da chave no HSM
    hsm_endpoint = Column(String(500))  # Endpoint do HSM
    hsm_credentials = Column(LargeBinary)  # Credenciais criptografadas

    # Cadeia de certificação
    cadeia_certificados = Column(Text)  # Cadeia de certificação (PEM)

    # Status e verificações
    status = Column(String(20), default='ativo')  # ativo, expirado, revogado, pendente
    ultima_verificacao_ocsp = Column(DateTime(timezone=True))
    resultado_ocsp = Column(String(50))  # good, revoked, unknown
    ultima_verificacao_crl = Column(DateTime(timezone=True))

    # Uso
    uso_principal = Column(String(50), default='nfe')  # nfe, nfce, cte, mdfe, todos
    is_default = Column(Boolean, default=False)  # Certificado padrão

    # Controle
    is_active = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    atualizado_em = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    empresa = relationship('EmpresaEmissora', back_populates='certificados')

    __table_args__ = (
        CheckConstraint(
            "tipo IN ('A1', 'A3', 'HSM')",
            name='check_tipo_certificado'
        ),
        CheckConstraint(
            "status IN ('ativo', 'expirado', 'revogado', 'pendente')",
            name='check_status_certificado'
        ),
        Index('idx_certificado_empresa', 'empresa_id'),
        Index('idx_certificado_validade', 'valido_ate'),
        Index('idx_certificado_serial', 'serial_number'),
    )

    def __repr__(self):
        return f'<CertificadoDigital {self.subject_cn} - Tipo: {self.tipo}>'

    def is_valid(self):
        """Verifica se o certificado está válido"""
        now = datetime.utcnow()
        return (
            self.is_active and
            self.status == 'ativo' and
            self.valido_de <= now <= self.valido_ate
        )

    def dias_para_expiracao(self):
        """Retorna dias até a expiração"""
        if self.valido_ate:
            delta = self.valido_ate - datetime.utcnow()
            return delta.days
        return None

    def to_dict(self, include_sensitive=False):
        result = {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'tipo': self.tipo,
            'nome_descritivo': self.nome_descritivo,
            'serial_number': self.serial_number,
            'subject_cn': self.subject_cn,
            'issuer_cn': self.issuer_cn,
            'valido_de': self.valido_de.isoformat() if self.valido_de else None,
            'valido_ate': self.valido_ate.isoformat() if self.valido_ate else None,
            'dias_para_expiracao': self.dias_para_expiracao(),
            'status': self.status,
            'is_valid': self.is_valid(),
            'is_default': self.is_default,
            'is_active': self.is_active
        }

        return result


# =============================================================================
# MODELO: SÉRIE FISCAL
# =============================================================================

class SerieFiscal(db.Model):
    """
    Controle de séries e numeração fiscal

    Cada série é um controle independente de numeração sequencial.
    Conforme MOC NF-e:
    - Série 0-889: Uso geral
    - Série 890-899: Uso interno (SCAN, SVC)
    - Série 900-999: Uso específico
    """
    __tablename__ = 'series_fiscais'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)

    # Identificação da série
    modelo = Column(String(2), nullable=False)  # 55=NFe, 65=NFCe, etc.
    serie = Column(Integer, nullable=False)  # Número da série
    descricao = Column(String(255))

    # Numeração
    numero_inicial = Column(Integer, default=1)
    numero_atual = Column(Integer, default=0)  # Último número usado
    numero_maximo = Column(Integer, default=999999999)  # 9 dígitos

    # Ambiente
    ambiente = Column(String(1), nullable=False)  # 1=Produção, 2=Homologação

    # Controle
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Série padrão para este modelo

    # Bloqueios
    bloqueada_em = Column(DateTime(timezone=True))
    motivo_bloqueio = Column(Text)

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    atualizado_em = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    empresa = relationship('EmpresaEmissora', back_populates='series_fiscais')
    documentos = relationship('DocumentoFiscal', back_populates='serie_fiscal')

    __table_args__ = (
        UniqueConstraint('empresa_id', 'modelo', 'serie', 'ambiente', name='uq_serie_fiscal'),
        CheckConstraint(
            "modelo IN ('55', '65', '57', '58', '59', '99')",
            name='check_modelo_documento'
        ),
        CheckConstraint(
            "ambiente IN ('1', '2')",
            name='check_ambiente_serie'
        ),
        CheckConstraint(
            "serie >= 0 AND serie <= 999",
            name='check_serie_range'
        ),
        Index('idx_serie_empresa_modelo', 'empresa_id', 'modelo'),
    )

    def __repr__(self):
        return f'<SerieFiscal Modelo:{self.modelo} Série:{self.serie}>'

    def obter_proximo_numero(self):
        """Obtém o próximo número disponível e incrementa o contador"""
        self.numero_atual += 1
        return self.numero_atual

    def to_dict(self):
        return {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'modelo': self.modelo,
            'serie': self.serie,
            'descricao': self.descricao,
            'numero_atual': self.numero_atual,
            'ambiente': self.ambiente,
            'is_active': self.is_active,
            'is_default': self.is_default
        }


# =============================================================================
# MODELO: DOCUMENTO FISCAL ELETRÔNICO
# =============================================================================

class DocumentoFiscal(db.Model):
    """
    Documento fiscal eletrônico principal (NF-e, NFC-e, NFS-e, CF-e-SAT)

    Armazena todas as informações do documento conforme layout SEFAZ.
    O XML completo é armazenado separadamente para performance.
    """
    __tablename__ = 'documentos_fiscais'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)
    serie_fiscal_id = Column(UUID(as_uuid=True), ForeignKey('series_fiscais.id'), nullable=False)

    # Identificação do documento
    modelo = Column(String(2), nullable=False)  # 55, 65, 57, 58, 59
    serie = Column(Integer, nullable=False)
    numero = Column(Integer, nullable=False)
    chave_acesso = Column(String(44), unique=True)  # 44 dígitos

    # Tipo e finalidade
    tipo_operacao = Column(String(1), nullable=False)  # 0=Entrada, 1=Saída
    finalidade = Column(String(1), default='1')  # 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    tipo_emissao = Column(String(1), default='1')  # 1=Normal, etc.
    indicador_presenca = Column(String(1), default='1')  # Presença do comprador

    # Ambiente e processamento
    ambiente = Column(String(1), nullable=False)  # 1=Produção, 2=Homologação
    status = Column(String(20), default='rascunho')

    # Datas
    data_emissao = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    data_saida_entrada = Column(DateTime(timezone=True))

    # Destinatário
    dest_tipo_pessoa = Column(String(2))  # PF, PJ, EX (Exterior)
    dest_cpf = Column(String(11))
    dest_cnpj = Column(String(14))
    dest_id_estrangeiro = Column(String(20))
    dest_nome = Column(String(255))
    dest_ie = Column(String(20))  # Inscrição Estadual
    dest_email = Column(String(255))
    dest_telefone = Column(String(20))

    # Endereço destinatário
    dest_logradouro = Column(String(255))
    dest_numero = Column(String(60))
    dest_complemento = Column(String(255))
    dest_bairro = Column(String(100))
    dest_cep = Column(String(8))
    dest_municipio = Column(String(255))
    dest_codigo_municipio_ibge = Column(String(7))
    dest_uf = Column(String(2))
    dest_pais = Column(String(100))
    dest_codigo_pais = Column(String(4))

    # Totais
    valor_produtos = Column(Numeric(15, 2), nullable=False, default=Decimal('0.00'))
    valor_frete = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_seguro = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_desconto = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_outras_despesas = Column(Numeric(15, 2), default=Decimal('0.00'))

    # Totais de impostos
    valor_icms_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_icms = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_icms_st_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_icms_st = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_ipi = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_pis = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_cofins = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_ii = Column(Numeric(15, 2), default=Decimal('0.00'))  # Imposto Importação
    valor_fcp = Column(Numeric(15, 2), default=Decimal('0.00'))  # Fundo Combate Pobreza

    # Total geral
    valor_total = Column(Numeric(15, 2), nullable=False, default=Decimal('0.00'))
    valor_tributos_aproximado = Column(Numeric(15, 2), default=Decimal('0.00'))  # Lei 12.741

    # Transporte
    modalidade_frete = Column(String(1), default='9')  # 0-9 conforme tabela
    transportadora_cnpj = Column(String(14))
    transportadora_nome = Column(String(255))
    transportadora_ie = Column(String(20))
    veiculo_placa = Column(String(7))
    veiculo_uf = Column(String(2))

    # Volumes
    volumes_quantidade = Column(Integer)
    volumes_especie = Column(String(60))
    volumes_marca = Column(String(60))
    volumes_numeracao = Column(String(60))
    volumes_peso_liquido = Column(Numeric(12, 3))
    volumes_peso_bruto = Column(Numeric(12, 3))

    # Informações adicionais
    informacoes_complementares = Column(Text)
    informacoes_fisco = Column(Text)

    # Referências a outros documentos
    nfe_referenciada = Column(String(44))  # Chave NFe referenciada

    # Protocolo SEFAZ
    protocolo_autorizacao = Column(String(20))
    data_autorizacao = Column(DateTime(timezone=True))
    motivo_autorizacao = Column(Text)

    # Cancelamento
    protocolo_cancelamento = Column(String(20))
    data_cancelamento = Column(DateTime(timezone=True))
    motivo_cancelamento = Column(Text)
    justificativa_cancelamento = Column(Text)

    # Carta de correção
    tem_carta_correcao = Column(Boolean, default=False)
    sequencia_carta_correcao = Column(Integer, default=0)

    # XML e DANFE
    xml_original = Column(Text)  # XML sem assinatura
    xml_assinado = Column(Text)  # XML com assinatura digital
    xml_protocolo = Column(Text)  # XML do protocolo de autorização
    xml_cancelamento = Column(Text)  # XML do cancelamento
    danfe_pdf = Column(LargeBinary)  # PDF do DANFE

    # Contingência
    data_contingencia = Column(DateTime(timezone=True))
    justificativa_contingencia = Column(Text)

    # Vínculo com venda/pedido
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    sale_id = Column(UUID(as_uuid=True), ForeignKey('sales.id'))

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    atualizado_em = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    criado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    empresa = relationship('EmpresaEmissora', back_populates='documentos_fiscais')
    serie_fiscal = relationship('SerieFiscal', back_populates='documentos')
    itens = relationship('ItemDocumentoFiscal', back_populates='documento', cascade='all, delete-orphan')
    pagamentos = relationship('PagamentoDocumentoFiscal', back_populates='documento', cascade='all, delete-orphan')
    eventos = relationship('EventoDocumentoFiscal', back_populates='documento', cascade='all, delete-orphan')
    cartas_correcao = relationship('CartaCorrecao', back_populates='documento', cascade='all, delete-orphan')
    order = relationship('Order', backref='documentos_fiscais')
    sale = relationship('Sale', backref='documentos_fiscais')

    __table_args__ = (
        UniqueConstraint('empresa_id', 'modelo', 'serie', 'numero', 'ambiente', name='uq_documento_fiscal'),
        CheckConstraint(
            "modelo IN ('55', '65', '57', '58', '59', '99')",
            name='check_modelo_documento_fiscal'
        ),
        CheckConstraint(
            "ambiente IN ('1', '2')",
            name='check_ambiente_documento_fiscal'
        ),
        CheckConstraint(
            "tipo_operacao IN ('0', '1')",
            name='check_tipo_operacao'
        ),
        CheckConstraint(
            "status IN ('rascunho', 'assinado', 'enviado', 'autorizado', 'rejeitado', 'denegado', 'cancelado', 'inutilizado', 'contingencia')",
            name='check_status_documento_fiscal'
        ),
        Index('idx_doc_fiscal_empresa', 'empresa_id'),
        Index('idx_doc_fiscal_chave', 'chave_acesso'),
        Index('idx_doc_fiscal_data', 'data_emissao'),
        Index('idx_doc_fiscal_status', 'status'),
        Index('idx_doc_fiscal_dest', 'dest_cnpj', 'dest_cpf'),
    )

    def __repr__(self):
        return f'<DocumentoFiscal Mod:{self.modelo} Série:{self.serie} Num:{self.numero}>'

    def gerar_chave_acesso(self, codigo_numerico=None):
        """
        Gera a chave de acesso de 44 dígitos conforme MOC

        Estrutura: cUF + AAMM + CNPJ + mod + série + nNF + tpEmis + cNF + cDV
        """
        import random

        codigo_uf = self.empresa.codigo_uf_ibge
        data = self.data_emissao
        aamm = data.strftime('%y%m')
        cnpj = self.empresa.cnpj.zfill(14)
        mod = str(self.modelo).zfill(2)
        serie = str(self.serie).zfill(3)
        num = str(self.numero).zfill(9)
        tp_emis = str(self.tipo_emissao)

        if codigo_numerico is None:
            codigo_numerico = random.randint(10000000, 99999999)
        cnf = str(codigo_numerico).zfill(8)

        # Chave sem dígito verificador
        chave_sem_dv = f"{codigo_uf}{aamm}{cnpj}{mod}{serie}{num}{tp_emis}{cnf}"

        # Calcula dígito verificador (módulo 11)
        dv = self._calcular_digito_verificador(chave_sem_dv)

        self.chave_acesso = f"{chave_sem_dv}{dv}"
        return self.chave_acesso

    def _calcular_digito_verificador(self, chave):
        """Calcula dígito verificador usando módulo 11"""
        pesos = [2, 3, 4, 5, 6, 7, 8, 9]
        soma = 0
        pos = 0

        for i in range(len(chave) - 1, -1, -1):
            soma += int(chave[i]) * pesos[pos % 8]
            pos += 1

        resto = soma % 11
        if resto in (0, 1):
            return '0'
        return str(11 - resto)

    def to_dict(self, include_xml=False):
        result = {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'modelo': self.modelo,
            'serie': self.serie,
            'numero': self.numero,
            'chave_acesso': self.chave_acesso,
            'tipo_operacao': self.tipo_operacao,
            'finalidade': self.finalidade,
            'ambiente': self.ambiente,
            'status': self.status,
            'data_emissao': self.data_emissao.isoformat() if self.data_emissao else None,
            'destinatario': {
                'tipo_pessoa': self.dest_tipo_pessoa,
                'cpf': self.dest_cpf,
                'cnpj': self.dest_cnpj,
                'nome': self.dest_nome,
                'email': self.dest_email
            },
            'totais': {
                'valor_produtos': float(self.valor_produtos),
                'valor_frete': float(self.valor_frete),
                'valor_desconto': float(self.valor_desconto),
                'valor_icms': float(self.valor_icms),
                'valor_pis': float(self.valor_pis),
                'valor_cofins': float(self.valor_cofins),
                'valor_total': float(self.valor_total)
            },
            'protocolo_autorizacao': self.protocolo_autorizacao,
            'data_autorizacao': self.data_autorizacao.isoformat() if self.data_autorizacao else None
        }

        if include_xml:
            result['xml_assinado'] = self.xml_assinado
            result['xml_protocolo'] = self.xml_protocolo

        return result


# =============================================================================
# MODELO: ITEM DO DOCUMENTO FISCAL
# =============================================================================

class ItemDocumentoFiscal(db.Model):
    """
    Itens do documento fiscal (det)

    Cada item representa um produto/serviço da nota fiscal.
    """
    __tablename__ = 'itens_documento_fiscal'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documento_id = Column(UUID(as_uuid=True), ForeignKey('documentos_fiscais.id'), nullable=False)

    # Número do item (nItem)
    numero_item = Column(Integer, nullable=False)

    # Produto
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'))
    codigo_produto = Column(String(60), nullable=False)  # cProd
    codigo_barras = Column(String(14))  # cEAN
    codigo_barras_tributavel = Column(String(14))  # cEANTrib
    descricao = Column(String(120), nullable=False)  # xProd
    ncm = Column(String(8), nullable=False)  # NCM
    cest = Column(String(7))  # CEST
    cfop = Column(String(4), nullable=False)  # CFOP

    # Unidade e quantidade
    unidade_comercial = Column(String(6), nullable=False)  # uCom
    quantidade_comercial = Column(Numeric(15, 4), nullable=False)  # qCom
    valor_unitario_comercial = Column(Numeric(21, 10), nullable=False)  # vUnCom

    unidade_tributavel = Column(String(6), nullable=False)  # uTrib
    quantidade_tributavel = Column(Numeric(15, 4), nullable=False)  # qTrib
    valor_unitario_tributavel = Column(Numeric(21, 10), nullable=False)  # vUnTrib

    # Valores
    valor_total_bruto = Column(Numeric(15, 2), nullable=False)  # vProd
    valor_frete = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_seguro = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_desconto = Column(Numeric(15, 2), default=Decimal('0.00'))
    valor_outras_despesas = Column(Numeric(15, 2), default=Decimal('0.00'))

    # Compõe valor total
    ind_total = Column(String(1), default='1')  # 0=Não, 1=Sim

    # ICMS
    icms_origem = Column(String(1), default='0')  # Origem da mercadoria
    icms_cst = Column(String(3))  # CST ou CSOSN
    icms_modalidade_bc = Column(String(1))  # Modalidade BC
    icms_reducao_bc = Column(Numeric(5, 2))  # % redução BC
    icms_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    icms_aliquota = Column(Numeric(5, 2), default=Decimal('0.00'))
    icms_valor = Column(Numeric(15, 2), default=Decimal('0.00'))

    # ICMS-ST
    icms_st_modalidade_bc = Column(String(1))
    icms_st_mva = Column(Numeric(5, 2))  # % MVA
    icms_st_reducao_bc = Column(Numeric(5, 2))
    icms_st_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    icms_st_aliquota = Column(Numeric(5, 2), default=Decimal('0.00'))
    icms_st_valor = Column(Numeric(15, 2), default=Decimal('0.00'))

    # FCP (Fundo Combate Pobreza)
    fcp_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    fcp_aliquota = Column(Numeric(5, 2), default=Decimal('0.00'))
    fcp_valor = Column(Numeric(15, 2), default=Decimal('0.00'))

    # IPI
    ipi_cst = Column(String(2))
    ipi_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    ipi_aliquota = Column(Numeric(5, 2), default=Decimal('0.00'))
    ipi_valor = Column(Numeric(15, 2), default=Decimal('0.00'))

    # PIS
    pis_cst = Column(String(2))
    pis_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    pis_aliquota = Column(Numeric(5, 2), default=Decimal('0.00'))
    pis_valor = Column(Numeric(15, 2), default=Decimal('0.00'))

    # COFINS
    cofins_cst = Column(String(2))
    cofins_base = Column(Numeric(15, 2), default=Decimal('0.00'))
    cofins_aliquota = Column(Numeric(5, 2), default=Decimal('0.00'))
    cofins_valor = Column(Numeric(15, 2), default=Decimal('0.00'))

    # ISSQN (para serviços)
    issqn_base = Column(Numeric(15, 2))
    issqn_aliquota = Column(Numeric(5, 2))
    issqn_valor = Column(Numeric(15, 2))
    issqn_codigo_servico = Column(String(10))
    issqn_codigo_municipio = Column(String(7))

    # Valor aproximado dos tributos (Lei 12.741)
    valor_tributos_aproximado = Column(Numeric(15, 2), default=Decimal('0.00'))
    percentual_tributos_federal = Column(Numeric(5, 2))
    percentual_tributos_estadual = Column(Numeric(5, 2))
    percentual_tributos_municipal = Column(Numeric(5, 2))

    # Informações adicionais do item
    informacoes_adicionais = Column(Text)

    # Relacionamentos
    documento = relationship('DocumentoFiscal', back_populates='itens')
    product = relationship('Product')

    __table_args__ = (
        UniqueConstraint('documento_id', 'numero_item', name='uq_item_documento'),
        CheckConstraint("numero_item > 0", name='check_numero_item'),
        Index('idx_item_doc_fiscal', 'documento_id'),
    )

    def __repr__(self):
        return f'<ItemDocumentoFiscal {self.numero_item}: {self.descricao[:30]}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'documento_id': str(self.documento_id),
            'numero_item': self.numero_item,
            'codigo_produto': self.codigo_produto,
            'descricao': self.descricao,
            'ncm': self.ncm,
            'cfop': self.cfop,
            'unidade': self.unidade_comercial,
            'quantidade': float(self.quantidade_comercial),
            'valor_unitario': float(self.valor_unitario_comercial),
            'valor_total': float(self.valor_total_bruto),
            'icms': {
                'cst': self.icms_cst,
                'base': float(self.icms_base),
                'aliquota': float(self.icms_aliquota),
                'valor': float(self.icms_valor)
            },
            'pis': {
                'cst': self.pis_cst,
                'base': float(self.pis_base),
                'aliquota': float(self.pis_aliquota),
                'valor': float(self.pis_valor)
            },
            'cofins': {
                'cst': self.cofins_cst,
                'base': float(self.cofins_base),
                'aliquota': float(self.cofins_aliquota),
                'valor': float(self.cofins_valor)
            }
        }


# =============================================================================
# MODELO: PAGAMENTO DO DOCUMENTO FISCAL
# =============================================================================

class PagamentoDocumentoFiscal(db.Model):
    """
    Formas de pagamento do documento fiscal (detPag)

    Conforme Nota Técnica 2016.002 e 2019.001
    """
    __tablename__ = 'pagamentos_documento_fiscal'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documento_id = Column(UUID(as_uuid=True), ForeignKey('documentos_fiscais.id'), nullable=False)

    # Indicador da forma de pagamento
    indicador_pagamento = Column(String(1), default='0')  # 0=À vista, 1=A prazo

    # Forma de pagamento
    forma_pagamento = Column(String(2), nullable=False)  # 01=Dinheiro, 03=Cartão, 17=PIX, etc.
    valor = Column(Numeric(15, 2), nullable=False)

    # Dados do cartão (se aplicável)
    tipo_integracao = Column(String(1))  # 1=Integrado, 2=Não integrado
    cnpj_credenciadora = Column(String(14))  # CNPJ da operadora
    bandeira_cartao = Column(String(2))  # 01=Visa, 02=Master, etc.
    codigo_autorizacao = Column(String(20))  # Código da autorização

    # Troco (para pagamento em dinheiro)
    valor_troco = Column(Numeric(15, 2), default=Decimal('0.00'))

    # Relacionamentos
    documento = relationship('DocumentoFiscal', back_populates='pagamentos')

    __table_args__ = (
        CheckConstraint(
            "forma_pagamento IN ('01', '02', '03', '04', '05', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '90', '99')",
            name='check_forma_pagamento'
        ),
        Index('idx_pag_doc_fiscal', 'documento_id'),
    )

    def __repr__(self):
        return f'<PagamentoDocumentoFiscal {self.forma_pagamento}: R$ {self.valor}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'documento_id': str(self.documento_id),
            'indicador_pagamento': self.indicador_pagamento,
            'forma_pagamento': self.forma_pagamento,
            'valor': float(self.valor),
            'valor_troco': float(self.valor_troco) if self.valor_troco else 0
        }


# =============================================================================
# MODELO: EVENTO DO DOCUMENTO FISCAL
# =============================================================================

class EventoDocumentoFiscal(db.Model):
    """
    Eventos do documento fiscal (Cancelamento, Carta de Correção, etc.)

    Conforme Nota Técnica 2012.002
    """
    __tablename__ = 'eventos_documento_fiscal'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documento_id = Column(UUID(as_uuid=True), ForeignKey('documentos_fiscais.id'), nullable=False)

    # Identificação do evento
    tipo_evento = Column(String(6), nullable=False)  # 110110=CC-e, 110111=Cancelamento, etc.
    sequencia = Column(Integer, default=1)  # nSeqEvento

    # Descrição do evento
    descricao_evento = Column(String(60))  # descEvento

    # Dados do evento
    data_evento = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    justificativa = Column(Text)  # xJust (15-255 caracteres)
    correcao = Column(Text)  # xCorrecao (para CC-e)

    # Protocolo
    protocolo = Column(String(20))
    data_protocolo = Column(DateTime(timezone=True))
    codigo_status = Column(Integer)  # cStat
    motivo = Column(Text)  # xMotivo

    # XML
    xml_evento = Column(Text)  # XML do evento
    xml_retorno = Column(Text)  # XML de retorno

    # Status
    status = Column(String(20), default='pendente')  # pendente, enviado, autorizado, rejeitado

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    criado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    documento = relationship('DocumentoFiscal', back_populates='eventos')

    __table_args__ = (
        UniqueConstraint('documento_id', 'tipo_evento', 'sequencia', name='uq_evento_documento'),
        CheckConstraint(
            "tipo_evento IN ('110110', '110111', '110112', '110140', '210200', '210210', '210220', '210240')",
            name='check_tipo_evento'
        ),
        Index('idx_evento_doc', 'documento_id'),
        Index('idx_evento_tipo', 'tipo_evento'),
    )

    def __repr__(self):
        return f'<EventoDocumentoFiscal Tipo:{self.tipo_evento} Seq:{self.sequencia}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'documento_id': str(self.documento_id),
            'tipo_evento': self.tipo_evento,
            'sequencia': self.sequencia,
            'descricao_evento': self.descricao_evento,
            'data_evento': self.data_evento.isoformat(),
            'protocolo': self.protocolo,
            'codigo_status': self.codigo_status,
            'motivo': self.motivo,
            'status': self.status
        }


# =============================================================================
# MODELO: CARTA DE CORREÇÃO ELETRÔNICA (CC-e)
# =============================================================================

class CartaCorrecao(db.Model):
    """
    Carta de Correção Eletrônica (CC-e)

    Conforme Ajuste SINIEF 01/07:
    - Limite de 20 correções por NF-e
    - Não permite correção de: CFOP, valores, alíquotas, quantidades
    """
    __tablename__ = 'cartas_correcao'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    documento_id = Column(UUID(as_uuid=True), ForeignKey('documentos_fiscais.id'), nullable=False)

    # Sequência (1-20)
    sequencia = Column(Integer, nullable=False)

    # Texto da correção
    texto_correcao = Column(Text, nullable=False)  # 15-1000 caracteres

    # Condição de uso (texto padrão)
    condicao_uso = Column(Text, default=(
        "A Carta de Correção é disciplinada pelo § 1º-A do art. 7º do Convênio S/N, "
        "de 15 de dezembro de 1970 e pode ser utilizada para regularização de erro "
        "ocorrido na emissão de documento fiscal, desde que o erro não esteja "
        "relacionado com: I - as variáveis que determinam o valor do imposto tais "
        "como: base de cálculo, alíquota, diferença de preço, quantidade, valor da "
        "operação ou da prestação; II - a correção de dados cadastrais que implique "
        "mudança do remetente ou do destinatário; III - a data de emissão ou de saída."
    ))

    # Protocolo SEFAZ
    protocolo = Column(String(20))
    data_protocolo = Column(DateTime(timezone=True))
    codigo_status = Column(Integer)
    motivo = Column(Text)

    # XML
    xml_carta = Column(Text)
    xml_retorno = Column(Text)

    # Status
    status = Column(String(20), default='pendente')

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    criado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    documento = relationship('DocumentoFiscal', back_populates='cartas_correcao')

    __table_args__ = (
        UniqueConstraint('documento_id', 'sequencia', name='uq_carta_correcao_seq'),
        CheckConstraint("sequencia >= 1 AND sequencia <= 20", name='check_sequencia_cce'),
        CheckConstraint("LENGTH(texto_correcao) >= 15 AND LENGTH(texto_correcao) <= 1000", name='check_tamanho_correcao'),
        Index('idx_carta_doc', 'documento_id'),
    )

    def __repr__(self):
        return f'<CartaCorrecao Doc:{self.documento_id} Seq:{self.sequencia}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'documento_id': str(self.documento_id),
            'sequencia': self.sequencia,
            'texto_correcao': self.texto_correcao,
            'protocolo': self.protocolo,
            'data_protocolo': self.data_protocolo.isoformat() if self.data_protocolo else None,
            'status': self.status
        }


# =============================================================================
# MODELO: INUTILIZAÇÃO DE NUMERAÇÃO
# =============================================================================

class InutilizacaoNumeracao(db.Model):
    """
    Registro de inutilização de numeração fiscal

    Conforme MOC - Inutilização de Numeração NF-e
    Deve ser solicitada até o 10º dia do mês subsequente
    """
    __tablename__ = 'inutilizacoes_numeracao'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)

    # Identificação
    modelo = Column(String(2), nullable=False)
    serie = Column(Integer, nullable=False)
    ambiente = Column(String(1), nullable=False)
    ano = Column(Integer, nullable=False)  # Ano com 2 dígitos (AAAA ou AA)

    # Faixa de numeração
    numero_inicial = Column(Integer, nullable=False)
    numero_final = Column(Integer, nullable=False)

    # Justificativa
    justificativa = Column(Text, nullable=False)  # 15-255 caracteres

    # Protocolo SEFAZ
    id_inutilizacao = Column(String(50))  # ID da inutilização
    protocolo = Column(String(20))
    data_protocolo = Column(DateTime(timezone=True))
    codigo_status = Column(Integer)
    motivo = Column(Text)

    # XML
    xml_envio = Column(Text)
    xml_retorno = Column(Text)

    # Status
    status = Column(String(20), default='pendente')

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    criado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    empresa = relationship('EmpresaEmissora')

    __table_args__ = (
        CheckConstraint("numero_final >= numero_inicial", name='check_faixa_inutilizacao'),
        CheckConstraint("LENGTH(justificativa) >= 15 AND LENGTH(justificativa) <= 255", name='check_justificativa_inut'),
        Index('idx_inutilizacao_empresa', 'empresa_id'),
        Index('idx_inutilizacao_serie', 'modelo', 'serie', 'ano'),
    )

    def __repr__(self):
        return f'<InutilizacaoNumeracao Série:{self.serie} {self.numero_inicial}-{self.numero_final}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'modelo': self.modelo,
            'serie': self.serie,
            'ano': self.ano,
            'numero_inicial': self.numero_inicial,
            'numero_final': self.numero_final,
            'justificativa': self.justificativa,
            'protocolo': self.protocolo,
            'status': self.status
        }


# =============================================================================
# MODELO: LOG DE COMUNICAÇÃO SEFAZ
# =============================================================================

class LogComunicacaoSefaz(db.Model):
    """
    Log de todas as comunicações com a SEFAZ

    Registra requisições e respostas para auditoria e troubleshooting.
    """
    __tablename__ = 'logs_comunicacao_sefaz'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)
    documento_id = Column(UUID(as_uuid=True), ForeignKey('documentos_fiscais.id'))

    # Tipo de operação
    tipo_operacao = Column(String(50), nullable=False)  # autorizacao, consulta, cancelamento, etc.
    ambiente = Column(String(1), nullable=False)

    # Endpoint
    webservice = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    metodo = Column(String(10), default='POST')

    # Requisição
    xml_envio = Column(Text)
    headers_envio = Column(Text)
    data_envio = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    # Resposta
    xml_retorno = Column(Text)
    headers_retorno = Column(Text)
    codigo_http = Column(Integer)
    data_retorno = Column(DateTime(timezone=True))
    tempo_resposta_ms = Column(Integer)  # Tempo em milissegundos

    # Resultado
    sucesso = Column(Boolean, default=False)
    codigo_status = Column(Integer)  # cStat SEFAZ
    motivo = Column(Text)  # xMotivo SEFAZ

    # Erro
    erro_mensagem = Column(Text)
    erro_stack = Column(Text)

    # IP e ambiente
    ip_origem = Column(String(50))

    __table_args__ = (
        Index('idx_log_sefaz_empresa', 'empresa_id'),
        Index('idx_log_sefaz_documento', 'documento_id'),
        Index('idx_log_sefaz_data', 'data_envio'),
        Index('idx_log_sefaz_tipo', 'tipo_operacao'),
    )

    def __repr__(self):
        return f'<LogComunicacaoSefaz {self.tipo_operacao} - {self.data_envio}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'documento_id': str(self.documento_id) if self.documento_id else None,
            'tipo_operacao': self.tipo_operacao,
            'ambiente': self.ambiente,
            'webservice': self.webservice,
            'url': self.url,
            'data_envio': self.data_envio.isoformat(),
            'data_retorno': self.data_retorno.isoformat() if self.data_retorno else None,
            'tempo_resposta_ms': self.tempo_resposta_ms,
            'sucesso': self.sucesso,
            'codigo_status': self.codigo_status,
            'motivo': self.motivo
        }


# =============================================================================
# MODELO: CONFIGURAÇÃO WEBSERVICES SEFAZ
# =============================================================================

class ConfiguracaoSefaz(db.Model):
    """
    Configuração dos WebServices SEFAZ por UF e ambiente

    Armazena URLs dos webservices para cada estado.
    """
    __tablename__ = 'configuracoes_sefaz'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Identificação
    uf = Column(String(2), nullable=False)
    ambiente = Column(String(1), nullable=False)  # 1=Produção, 2=Homologação
    modelo = Column(String(2), nullable=False)  # 55=NFe, 65=NFCe

    # Autorizador (AN, BA, CE, GO, MG, MS, MT, PE, PR, RS, SP, SVAN, SVRS, SVC-AN, SVC-RS)
    autorizador = Column(String(10), nullable=False)

    # WebServices
    ws_autorizacao = Column(String(500))
    ws_retorno_autorizacao = Column(String(500))
    ws_consulta_protocolo = Column(String(500))
    ws_inutilizacao = Column(String(500))
    ws_consulta_cadastro = Column(String(500))
    ws_status_servico = Column(String(500))
    ws_recepcao_evento = Column(String(500))
    ws_distribuicao_dfe = Column(String(500))

    # Versão do layout
    versao = Column(String(10), default='4.00')

    # Status
    is_active = Column(Boolean, default=True)
    atualizado_em = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('uf', 'ambiente', 'modelo', name='uq_config_sefaz'),
        Index('idx_config_sefaz_uf', 'uf'),
    )

    def __repr__(self):
        return f'<ConfiguracaoSefaz UF:{self.uf} Amb:{self.ambiente} Mod:{self.modelo}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'uf': self.uf,
            'ambiente': self.ambiente,
            'modelo': self.modelo,
            'autorizador': self.autorizador,
            'versao': self.versao,
            'webservices': {
                'autorizacao': self.ws_autorizacao,
                'retorno_autorizacao': self.ws_retorno_autorizacao,
                'consulta_protocolo': self.ws_consulta_protocolo,
                'inutilizacao': self.ws_inutilizacao,
                'consulta_cadastro': self.ws_consulta_cadastro,
                'status_servico': self.ws_status_servico,
                'recepcao_evento': self.ws_recepcao_evento,
                'distribuicao_dfe': self.ws_distribuicao_dfe
            }
        }


# =============================================================================
# MODELO: CONTINGÊNCIA FISCAL
# =============================================================================

class ContingenciaFiscal(db.Model):
    """
    Registro de períodos de contingência fiscal

    Quando a SEFAZ está indisponível ou há problemas de comunicação.
    """
    __tablename__ = 'contingencias_fiscais'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey('empresas_emissoras.id'), nullable=False)

    # Tipo de contingência
    tipo_contingencia = Column(String(1), nullable=False)  # 2=FS-IA, 4=EPEC, 5=FS-DA, 6=SVC-AN, 7=SVC-RS, 9=Offline

    # Período
    data_inicio = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    data_fim = Column(DateTime(timezone=True))

    # Justificativa
    justificativa = Column(Text, nullable=False)  # 15-256 caracteres

    # Documentos emitidos em contingência
    total_documentos = Column(Integer, default=0)
    documentos_transmitidos = Column(Integer, default=0)

    # Status
    status = Column(String(20), default='ativa')  # ativa, encerrada, transmitida

    # Auditoria
    criado_em = Column(DateTime(timezone=True), default=datetime.utcnow)
    criado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    encerrado_por = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    empresa = relationship('EmpresaEmissora')

    __table_args__ = (
        CheckConstraint(
            "tipo_contingencia IN ('2', '4', '5', '6', '7', '9')",
            name='check_tipo_contingencia'
        ),
        Index('idx_contingencia_empresa', 'empresa_id'),
        Index('idx_contingencia_data', 'data_inicio'),
    )

    def __repr__(self):
        return f'<ContingenciaFiscal Tipo:{self.tipo_contingencia} Início:{self.data_inicio}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'empresa_id': str(self.empresa_id),
            'tipo_contingencia': self.tipo_contingencia,
            'data_inicio': self.data_inicio.isoformat(),
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'justificativa': self.justificativa,
            'total_documentos': self.total_documentos,
            'documentos_transmitidos': self.documentos_transmitidos,
            'status': self.status
        }


# =============================================================================
# MODELO: AUDITORIA FISCAL
# =============================================================================

class AuditoriaFiscal(db.Model):
    """
    Log de auditoria para operações fiscais

    Registra todas as operações sensíveis para compliance.
    Imutável - não pode ser alterado ou excluído.
    """
    __tablename__ = 'auditorias_fiscais'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Entidade afetada
    entidade = Column(String(100), nullable=False)  # documento_fiscal, empresa, certificado, etc.
    entidade_id = Column(UUID(as_uuid=True), nullable=False)

    # Operação
    operacao = Column(String(50), nullable=False)  # create, update, delete, authorize, cancel, etc.

    # Dados
    dados_anteriores = Column(JSONB)  # Estado anterior (para updates)
    dados_novos = Column(JSONB)  # Estado novo
    campos_alterados = Column(JSONB)  # Lista de campos alterados

    # Contexto
    ip_origem = Column(String(50))
    user_agent = Column(String(500))
    sessao_id = Column(UUID(as_uuid=True))

    # Usuário
    usuario_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    usuario_nome = Column(String(255))  # Snapshot do nome
    usuario_email = Column(String(255))  # Snapshot do email

    # Timestamp imutável
    data_hora = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    # Hash de integridade
    hash_registro = Column(String(64))  # SHA-256 do registro

    __table_args__ = (
        Index('idx_auditoria_entidade', 'entidade', 'entidade_id'),
        Index('idx_auditoria_usuario', 'usuario_id'),
        Index('idx_auditoria_data', 'data_hora'),
        Index('idx_auditoria_operacao', 'operacao'),
    )

    def __repr__(self):
        return f'<AuditoriaFiscal {self.operacao} em {self.entidade}>'

    def calcular_hash(self):
        """Calcula hash de integridade do registro"""
        import hashlib
        dados = f"{self.id}{self.entidade}{self.entidade_id}{self.operacao}{self.data_hora}{self.usuario_id}"
        self.hash_registro = hashlib.sha256(dados.encode()).hexdigest()
        return self.hash_registro

    def to_dict(self):
        return {
            'id': str(self.id),
            'entidade': self.entidade,
            'entidade_id': str(self.entidade_id),
            'operacao': self.operacao,
            'campos_alterados': self.campos_alterados,
            'usuario_nome': self.usuario_nome,
            'data_hora': self.data_hora.isoformat(),
            'ip_origem': self.ip_origem
        }
