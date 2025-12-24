"""
Serviço de Comunicação com SEFAZ

Este módulo implementa toda a comunicação com os WebServices da SEFAZ para:
- Autorização de NF-e/NFC-e
- Consulta de protocolo
- Cancelamento
- Carta de Correção
- Inutilização de numeração
- Status do serviço
- Distribuição de DF-e

Referências:
- Manual de Orientação do Contribuinte (MOC) versão 7.0
- Nota Técnica 2019.001
- WebServices SEFAZ Nacional e Estaduais

Ambientes:
- Produção (tpAmb=1): Notas com valor fiscal
- Homologação (tpAmb=2): Testes sem valor fiscal
"""

import os
import re
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
from xml.etree import ElementTree as ET

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

try:
    from lxml import etree
    LXML_AVAILABLE = True
except ImportError:
    LXML_AVAILABLE = False


logger = logging.getLogger(__name__)


# =============================================================================
# CONSTANTES E CONFIGURAÇÕES
# =============================================================================

# Versão do layout NF-e
VERSAO_NFE = "4.00"

# Namespaces
NS_NFE = "http://www.portalfiscal.inf.br/nfe"
NS_SOAP = "http://www.w3.org/2003/05/soap-envelope"

# Timeout padrão para requests (segundos)
TIMEOUT_PADRAO = 30

# Códigos de status de sucesso
CODIGOS_SUCESSO = [100, 135, 136]  # 100=Autorizado, 135=Evento registrado, 136=Evento já registrado


class AmbienteSefaz(Enum):
    """Ambiente de operação"""
    PRODUCAO = "1"
    HOMOLOGACAO = "2"


class TipoServico(Enum):
    """Tipos de serviço SEFAZ"""
    AUTORIZACAO = "NfeAutorizacao"
    RETORNO_AUTORIZACAO = "NfeRetAutorizacao"
    CONSULTA_PROTOCOLO = "NfeConsultaProtocolo"
    STATUS_SERVICO = "NfeStatusServico"
    RECEPCAO_EVENTO = "NfeRecepcaoEvento"
    INUTILIZACAO = "NfeInutilizacao"
    CONSULTA_CADASTRO = "NfeConsultaCadastro"
    DISTRIBUICAO_DFE = "NFeDistribuicaoDFe"


@dataclass
class ResultadoSefaz:
    """Resultado de uma operação com a SEFAZ"""
    sucesso: bool
    codigo_status: int
    motivo: str
    protocolo: Optional[str] = None
    data_recebimento: Optional[datetime] = None
    xml_retorno: Optional[str] = None
    xml_enviado: Optional[str] = None
    chave_acesso: Optional[str] = None
    numero_recibo: Optional[str] = None
    tempo_resposta_ms: Optional[int] = None
    erros: List[str] = None

    def __post_init__(self):
        if self.erros is None:
            self.erros = []


@dataclass
class ConfiguracaoWebService:
    """Configuração de um WebService SEFAZ"""
    url: str
    versao: str = VERSAO_NFE
    namespace: str = NS_NFE
    acao_soap: Optional[str] = None


# =============================================================================
# TABELA DE WEBSERVICES SEFAZ POR UF
# =============================================================================

WEBSERVICES_NFE = {
    # Produção - NFe (mod 55)
    "1": {
        "SP": {
            "autorizador": "SP",
            "NfeAutorizacao": "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
            "NfeRetAutorizacao": "https://nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx",
            "NfeConsultaProtocolo": "https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx",
            "NfeStatusServico": "https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx",
            "NfeRecepcaoEvento": "https://nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx",
            "NfeInutilizacao": "https://nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx",
        },
        "MG": {
            "autorizador": "MG",
            "NfeAutorizacao": "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4",
            "NfeRetAutorizacao": "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4",
            "NfeConsultaProtocolo": "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
            "NfeStatusServico": "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4",
            "NfeRecepcaoEvento": "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4",
            "NfeInutilizacao": "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4",
        },
        "RJ": {
            "autorizador": "SVRS",
            "NfeAutorizacao": "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
            "NfeRetAutorizacao": "https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
            "NfeConsultaProtocolo": "https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
            "NfeStatusServico": "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
            "NfeRecepcaoEvento": "https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx",
            "NfeInutilizacao": "https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx",
        },
        "RS": {
            "autorizador": "RS",
            "NfeAutorizacao": "https://nfe.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
            "NfeRetAutorizacao": "https://nfe.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
            "NfeConsultaProtocolo": "https://nfe.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
            "NfeStatusServico": "https://nfe.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
            "NfeRecepcaoEvento": "https://nfe.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx",
            "NfeInutilizacao": "https://nfe.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx",
        },
        "PR": {
            "autorizador": "PR",
            "NfeAutorizacao": "https://nfe.sefa.pr.gov.br/nfe/NFeAutorizacao4?wsdl",
            "NfeRetAutorizacao": "https://nfe.sefa.pr.gov.br/nfe/NFeRetAutorizacao4?wsdl",
            "NfeConsultaProtocolo": "https://nfe.sefa.pr.gov.br/nfe/NFeConsultaProtocolo4?wsdl",
            "NfeStatusServico": "https://nfe.sefa.pr.gov.br/nfe/NFeStatusServico4?wsdl",
            "NfeRecepcaoEvento": "https://nfe.sefa.pr.gov.br/nfe/NFeRecepcaoEvento4?wsdl",
            "NfeInutilizacao": "https://nfe.sefa.pr.gov.br/nfe/NFeInutilizacao4?wsdl",
        },
        # Estados que usam SVRS
        "DEFAULT_SVRS": {
            "autorizador": "SVRS",
            "NfeAutorizacao": "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
            "NfeRetAutorizacao": "https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
            "NfeConsultaProtocolo": "https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
            "NfeStatusServico": "https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
            "NfeRecepcaoEvento": "https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx",
            "NfeInutilizacao": "https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx",
        },
    },
    # Homologação - NFe (mod 55)
    "2": {
        "SP": {
            "autorizador": "SP",
            "NfeAutorizacao": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
            "NfeRetAutorizacao": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx",
            "NfeConsultaProtocolo": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx",
            "NfeStatusServico": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx",
            "NfeRecepcaoEvento": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx",
            "NfeInutilizacao": "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx",
        },
        "MG": {
            "autorizador": "MG",
            "NfeAutorizacao": "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4",
            "NfeRetAutorizacao": "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4",
            "NfeConsultaProtocolo": "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
            "NfeStatusServico": "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4",
            "NfeRecepcaoEvento": "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4",
            "NfeInutilizacao": "https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4",
        },
        "DEFAULT_SVRS": {
            "autorizador": "SVRS",
            "NfeAutorizacao": "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx",
            "NfeRetAutorizacao": "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx",
            "NfeConsultaProtocolo": "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx",
            "NfeStatusServico": "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx",
            "NfeRecepcaoEvento": "https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx",
            "NfeInutilizacao": "https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx",
        },
    }
}

# Estados que usam SVRS
ESTADOS_SVRS = ["AC", "AL", "AP", "DF", "ES", "PB", "PI", "RJ", "RN", "RO", "RR", "SC", "SE", "TO"]


class SefazService:
    """
    Serviço de comunicação com a SEFAZ

    Implementa todos os WebServices necessários para emissão de NF-e/NFC-e
    """

    def __init__(
        self,
        uf: str,
        ambiente: str = "2",
        certificado_pfx: bytes = None,
        certificado_senha: str = None,
        timeout: int = TIMEOUT_PADRAO
    ):
        """
        Inicializa o serviço SEFAZ

        Args:
            uf: UF do emitente (SP, MG, RJ, etc.)
            ambiente: 1=Produção, 2=Homologação
            certificado_pfx: Bytes do arquivo PFX
            certificado_senha: Senha do certificado
            timeout: Timeout em segundos
        """
        self.uf = uf.upper()
        self.ambiente = ambiente
        self.timeout = timeout

        # Certificado
        self._cert_pfx = certificado_pfx
        self._cert_senha = certificado_senha
        self._cert_temp_path = None

        # Session HTTP com retry
        self._session = self._criar_session()

        # Obtém configuração de WebServices
        self._webservices = self._obter_webservices()

    def _criar_session(self) -> requests.Session:
        """Cria session HTTP com configurações de retry"""
        if not REQUESTS_AVAILABLE:
            return None

        session = requests.Session()

        # Configura retry
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        session.mount("http://", adapter)

        return session

    def _obter_webservices(self) -> Dict[str, str]:
        """Obtém URLs dos WebServices para a UF"""
        ws = WEBSERVICES_NFE.get(self.ambiente, {})

        # Verifica se tem configuração específica para a UF
        if self.uf in ws:
            return ws[self.uf]

        # Se não, usa SVRS (maioria dos estados)
        if self.uf in ESTADOS_SVRS:
            return ws.get("DEFAULT_SVRS", {})

        # Fallback para SVRS
        return ws.get("DEFAULT_SVRS", {})

    def _preparar_certificado(self) -> Optional[str]:
        """
        Prepara certificado para uso em requests

        Para requests com certificado cliente, precisamos de arquivos temporários
        """
        if not self._cert_pfx:
            return None

        try:
            import tempfile
            from cryptography.hazmat.primitives.serialization import pkcs12

            # Carrega PFX
            private_key, certificate, chain = pkcs12.load_key_and_certificates(
                self._cert_pfx,
                self._cert_senha.encode() if self._cert_senha else None
            )

            # Cria arquivo temporário com certificado + chave
            cert_pem = certificate.public_bytes(
                serialization.Encoding.PEM
            )
            key_pem = private_key.private_bytes(
                serialization.Encoding.PEM,
                serialization.PrivateFormat.PKCS8,
                serialization.NoEncryption()
            )

            # Salva em arquivo temporário
            fd, path = tempfile.mkstemp(suffix='.pem')
            with os.fdopen(fd, 'wb') as f:
                f.write(cert_pem)
                f.write(key_pem)

            self._cert_temp_path = path
            return path

        except ImportError:
            logger.warning("cryptography não disponível para preparar certificado")
            return None
        except Exception as e:
            logger.error(f"Erro ao preparar certificado: {str(e)}")
            return None

    def _construir_envelope_soap(self, xml_dados: str, servico: str) -> str:
        """
        Constrói envelope SOAP para envio à SEFAZ

        Estrutura:
        <soap:Envelope>
            <soap:Body>
                <nfeDadosMsg xmlns="...">
                    {xml_dados}
                </nfeDadosMsg>
            </soap:Body>
        </soap:Envelope>
        """
        # Determina namespace da mensagem
        if "Inut" in servico:
            ns_metodo = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeInutilizacao4"
        elif "Evento" in servico:
            ns_metodo = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4"
        elif "Status" in servico:
            ns_metodo = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"
        elif "Consulta" in servico:
            ns_metodo = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4"
        elif "RetAutorizacao" in servico:
            ns_metodo = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4"
        else:
            ns_metodo = "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"

        envelope = f"""<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:soap12="{NS_SOAP}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap12:Body>
        <nfeDadosMsg xmlns="{ns_metodo}">
            {xml_dados}
        </nfeDadosMsg>
    </soap12:Body>
</soap12:Envelope>"""

        return envelope

    def _enviar_request(
        self,
        servico: str,
        xml_dados: str
    ) -> Tuple[bool, str, int]:
        """
        Envia request para WebService SEFAZ

        Args:
            servico: Nome do serviço (NfeAutorizacao, etc.)
            xml_dados: XML a ser enviado

        Returns:
            Tuple (sucesso, xml_resposta, tempo_ms)
        """
        if not REQUESTS_AVAILABLE:
            return False, "Biblioteca requests não disponível", 0

        url = self._webservices.get(servico)
        if not url:
            return False, f"URL do serviço {servico} não configurada para UF {self.uf}", 0

        # Constrói envelope SOAP
        envelope = self._construir_envelope_soap(xml_dados, servico)

        # Headers
        headers = {
            "Content-Type": "application/soap+xml; charset=utf-8",
            "SOAPAction": f'"{url}"'
        }

        # Prepara certificado
        cert_path = self._preparar_certificado()

        try:
            inicio = datetime.now()

            response = self._session.post(
                url,
                data=envelope.encode('utf-8'),
                headers=headers,
                cert=cert_path if cert_path else None,
                verify=True,
                timeout=self.timeout
            )

            tempo_ms = int((datetime.now() - inicio).total_seconds() * 1000)

            if response.status_code == 200:
                return True, response.text, tempo_ms
            else:
                return False, f"HTTP {response.status_code}: {response.text}", tempo_ms

        except requests.exceptions.Timeout:
            return False, "Timeout na comunicação com SEFAZ", 0
        except requests.exceptions.SSLError as e:
            return False, f"Erro SSL: {str(e)}", 0
        except requests.exceptions.ConnectionError as e:
            return False, f"Erro de conexão: {str(e)}", 0
        except Exception as e:
            return False, f"Erro: {str(e)}", 0
        finally:
            # Remove arquivo temporário do certificado
            if self._cert_temp_path and os.path.exists(self._cert_temp_path):
                try:
                    os.remove(self._cert_temp_path)
                except Exception:
                    pass

    def _extrair_resposta_soap(self, xml_resposta: str) -> str:
        """Extrai conteúdo da resposta SOAP"""
        try:
            # Remove declaração XML se houver
            xml_limpo = re.sub(r'<\?xml[^>]*\?>', '', xml_resposta)

            # Parse como ElementTree
            root = ET.fromstring(xml_limpo)

            # Procura pelo Body do SOAP
            for elem in root.iter():
                if 'Body' in elem.tag:
                    # Retorna primeiro filho do Body
                    for child in elem:
                        return ET.tostring(child, encoding='unicode')

            return xml_resposta
        except Exception as e:
            logger.error(f"Erro ao extrair resposta SOAP: {str(e)}")
            return xml_resposta

    def _parsear_retorno_autorizacao(self, xml_retorno: str) -> ResultadoSefaz:
        """Parseia retorno de autorização"""
        try:
            root = ET.fromstring(xml_retorno)

            # Namespace
            ns = {'nfe': NS_NFE}

            # Procura elementos de retorno
            cstat = None
            xmotivo = None
            protocolo = None
            chave = None
            data_rec = None

            for elem in root.iter():
                tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag

                if tag == 'cStat':
                    cstat = int(elem.text) if elem.text else 0
                elif tag == 'xMotivo':
                    xmotivo = elem.text or ''
                elif tag == 'nProt':
                    protocolo = elem.text
                elif tag == 'chNFe':
                    chave = elem.text
                elif tag == 'dhRecbto':
                    try:
                        data_rec = datetime.fromisoformat(elem.text.replace('Z', '+00:00'))
                    except Exception:
                        pass

            sucesso = cstat in CODIGOS_SUCESSO

            return ResultadoSefaz(
                sucesso=sucesso,
                codigo_status=cstat or 0,
                motivo=xmotivo or '',
                protocolo=protocolo,
                chave_acesso=chave,
                data_recebimento=data_rec,
                xml_retorno=xml_retorno
            )

        except Exception as e:
            logger.error(f"Erro ao parsear retorno: {str(e)}")
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=f"Erro ao parsear resposta: {str(e)}",
                xml_retorno=xml_retorno
            )

    def autorizar_nfe(self, xml_nfe_assinado: str, sincrono: bool = True) -> ResultadoSefaz:
        """
        Envia NF-e para autorização

        Args:
            xml_nfe_assinado: XML da NF-e já assinado
            sincrono: True para processamento síncrono (1 NF-e)

        Returns:
            ResultadoSefaz com resultado da operação
        """
        # Monta lote
        id_lote = str(uuid.uuid4().int)[:15]
        ind_sinc = "1" if sincrono else "0"

        xml_lote = f"""<enviNFe xmlns="{NS_NFE}" versao="{VERSAO_NFE}">
            <idLote>{id_lote}</idLote>
            <indSinc>{ind_sinc}</indSinc>
            {xml_nfe_assinado}
        </enviNFe>"""

        # Envia
        sucesso, resposta, tempo = self._enviar_request("NfeAutorizacao", xml_lote)

        if not sucesso:
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=resposta,
                tempo_resposta_ms=tempo,
                xml_enviado=xml_lote
            )

        # Extrai resposta
        xml_retorno = self._extrair_resposta_soap(resposta)

        # Parseia resultado
        resultado = self._parsear_retorno_autorizacao(xml_retorno)
        resultado.tempo_resposta_ms = tempo
        resultado.xml_enviado = xml_lote
        resultado.numero_recibo = id_lote

        return resultado

    def consultar_protocolo(self, chave_acesso: str) -> ResultadoSefaz:
        """
        Consulta situação de NF-e pela chave de acesso

        Args:
            chave_acesso: Chave de 44 dígitos

        Returns:
            ResultadoSefaz
        """
        xml_consulta = f"""<consSitNFe xmlns="{NS_NFE}" versao="{VERSAO_NFE}">
            <tpAmb>{self.ambiente}</tpAmb>
            <xServ>CONSULTAR</xServ>
            <chNFe>{chave_acesso}</chNFe>
        </consSitNFe>"""

        sucesso, resposta, tempo = self._enviar_request("NfeConsultaProtocolo", xml_consulta)

        if not sucesso:
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=resposta,
                tempo_resposta_ms=tempo
            )

        xml_retorno = self._extrair_resposta_soap(resposta)
        resultado = self._parsear_retorno_autorizacao(xml_retorno)
        resultado.tempo_resposta_ms = tempo
        resultado.chave_acesso = chave_acesso

        return resultado

    def status_servico(self) -> ResultadoSefaz:
        """
        Consulta status do serviço SEFAZ

        Returns:
            ResultadoSefaz com status do serviço
        """
        # Código UF
        codigo_uf = {
            "AC": "12", "AL": "27", "AP": "16", "AM": "13", "BA": "29",
            "CE": "23", "DF": "53", "ES": "32", "GO": "52", "MA": "21",
            "MT": "51", "MS": "50", "MG": "31", "PA": "15", "PB": "25",
            "PR": "41", "PE": "26", "PI": "22", "RJ": "33", "RN": "24",
            "RS": "43", "RO": "11", "RR": "14", "SC": "42", "SP": "35",
            "SE": "28", "TO": "17"
        }.get(self.uf, "35")

        xml_status = f"""<consStatServ xmlns="{NS_NFE}" versao="{VERSAO_NFE}">
            <tpAmb>{self.ambiente}</tpAmb>
            <cUF>{codigo_uf}</cUF>
            <xServ>STATUS</xServ>
        </consStatServ>"""

        sucesso, resposta, tempo = self._enviar_request("NfeStatusServico", xml_status)

        if not sucesso:
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=resposta,
                tempo_resposta_ms=tempo
            )

        xml_retorno = self._extrair_resposta_soap(resposta)

        # Parseia status
        try:
            root = ET.fromstring(xml_retorno)
            cstat = None
            xmotivo = None

            for elem in root.iter():
                tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                if tag == 'cStat':
                    cstat = int(elem.text) if elem.text else 0
                elif tag == 'xMotivo':
                    xmotivo = elem.text or ''

            # Status 107 = Serviço em operação
            sucesso = cstat == 107

            return ResultadoSefaz(
                sucesso=sucesso,
                codigo_status=cstat or 0,
                motivo=xmotivo or '',
                tempo_resposta_ms=tempo,
                xml_retorno=xml_retorno
            )

        except Exception as e:
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=f"Erro ao parsear status: {str(e)}",
                tempo_resposta_ms=tempo,
                xml_retorno=xml_retorno
            )

    def enviar_evento(self, xml_evento_assinado: str) -> ResultadoSefaz:
        """
        Envia evento (cancelamento, carta de correção, etc.)

        Args:
            xml_evento_assinado: XML do evento assinado

        Returns:
            ResultadoSefaz
        """
        id_lote = str(uuid.uuid4().int)[:15]

        xml_lote = f"""<envEvento xmlns="{NS_NFE}" versao="{VERSAO_NFE}">
            <idLote>{id_lote}</idLote>
            {xml_evento_assinado}
        </envEvento>"""

        sucesso, resposta, tempo = self._enviar_request("NfeRecepcaoEvento", xml_lote)

        if not sucesso:
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=resposta,
                tempo_resposta_ms=tempo,
                xml_enviado=xml_lote
            )

        xml_retorno = self._extrair_resposta_soap(resposta)
        resultado = self._parsear_retorno_autorizacao(xml_retorno)
        resultado.tempo_resposta_ms = tempo
        resultado.xml_enviado = xml_lote

        return resultado

    def inutilizar_numeracao(self, xml_inutilizacao_assinado: str) -> ResultadoSefaz:
        """
        Inutiliza faixa de numeração

        Args:
            xml_inutilizacao_assinado: XML de inutilização assinado

        Returns:
            ResultadoSefaz
        """
        sucesso, resposta, tempo = self._enviar_request(
            "NfeInutilizacao",
            xml_inutilizacao_assinado
        )

        if not sucesso:
            return ResultadoSefaz(
                sucesso=False,
                codigo_status=0,
                motivo=resposta,
                tempo_resposta_ms=tempo
            )

        xml_retorno = self._extrair_resposta_soap(resposta)
        resultado = self._parsear_retorno_autorizacao(xml_retorno)
        resultado.tempo_resposta_ms = tempo

        return resultado

    def __del__(self):
        """Limpa recursos"""
        if self._cert_temp_path and os.path.exists(self._cert_temp_path):
            try:
                os.remove(self._cert_temp_path)
            except Exception:
                pass


class SefazServiceFactory:
    """Factory para criar instâncias do serviço SEFAZ"""

    _instances: Dict[str, SefazService] = {}

    @classmethod
    def criar_servico(
        cls,
        uf: str,
        ambiente: str = "2",
        certificado_pfx: bytes = None,
        certificado_senha: str = None
    ) -> SefazService:
        """
        Cria ou reutiliza instância do serviço SEFAZ

        Args:
            uf: UF do emitente
            ambiente: 1=Produção, 2=Homologação
            certificado_pfx: Bytes do certificado
            certificado_senha: Senha

        Returns:
            SefazService configurado
        """
        key = f"{uf}_{ambiente}"

        if key not in cls._instances or certificado_pfx:
            cls._instances[key] = SefazService(
                uf=uf,
                ambiente=ambiente,
                certificado_pfx=certificado_pfx,
                certificado_senha=certificado_senha
            )

        return cls._instances[key]

    @classmethod
    def limpar_cache(cls):
        """Limpa cache de instâncias"""
        cls._instances.clear()
