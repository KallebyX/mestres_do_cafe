"""
Serviço Fiscal Principal - Orquestrador de Emissão de NF-e/NFC-e

Este módulo integra todos os componentes do sistema fiscal:
- Geração de XML (nfe_xml_builder)
- Gestão de certificados (certificate_service)
- Comunicação SEFAZ (sefaz_service)
- Persistência e auditoria

Fluxo de emissão:
1. Validação dos dados fiscais
2. Cálculo de impostos
3. Geração do XML
4. Assinatura digital
5. Envio para SEFAZ
6. Processamento da resposta
7. Armazenamento e auditoria
8. Notificação ao contador

Conformidade:
- MOC NF-e versão 7.0
- Ajuste SINIEF 07/05
- Resolução CGSN 140/2018 (Simples Nacional)
"""

import uuid
import json
import hashlib
import logging
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum

from database import db

logger = logging.getLogger(__name__)


# =============================================================================
# DATA CLASSES PARA RESULTADOS
# =============================================================================

@dataclass
class ResultadoEmissao:
    """Resultado completo da emissão de documento fiscal"""
    sucesso: bool
    mensagem: str
    documento_id: Optional[str] = None
    chave_acesso: Optional[str] = None
    numero_nota: Optional[int] = None
    serie: Optional[int] = None
    protocolo: Optional[str] = None
    data_autorizacao: Optional[datetime] = None
    xml_autorizado: Optional[str] = None
    danfe_pdf: Optional[bytes] = None
    erros: List[str] = field(default_factory=list)
    avisos: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            'sucesso': self.sucesso,
            'mensagem': self.mensagem,
            'documento_id': self.documento_id,
            'chave_acesso': self.chave_acesso,
            'numero_nota': self.numero_nota,
            'serie': self.serie,
            'protocolo': self.protocolo,
            'data_autorizacao': self.data_autorizacao.isoformat() if self.data_autorizacao else None,
            'erros': self.erros,
            'avisos': self.avisos
        }


@dataclass
class DadosEmissao:
    """Dados necessários para emissão de documento fiscal"""
    # Empresa emissora
    empresa_id: str

    # Tipo de documento
    modelo: str  # 55=NFe, 65=NFCe
    tipo_operacao: str = "1"  # 0=Entrada, 1=Saída
    finalidade: str = "1"  # 1=Normal
    indicador_presenca: str = "1"  # 1=Presencial

    # Destinatário
    dest_tipo_pessoa: Optional[str] = None  # PF, PJ
    dest_cpf: Optional[str] = None
    dest_cnpj: Optional[str] = None
    dest_nome: Optional[str] = None
    dest_email: Optional[str] = None
    dest_telefone: Optional[str] = None
    dest_ie: Optional[str] = None

    # Endereço destinatário
    dest_logradouro: Optional[str] = None
    dest_numero: Optional[str] = None
    dest_complemento: Optional[str] = None
    dest_bairro: Optional[str] = None
    dest_cep: Optional[str] = None
    dest_municipio: Optional[str] = None
    dest_codigo_municipio: Optional[str] = None
    dest_uf: Optional[str] = None

    # Itens
    itens: List[Dict] = field(default_factory=list)

    # Pagamentos
    pagamentos: List[Dict] = field(default_factory=list)

    # Transporte
    modalidade_frete: str = "9"  # 9=Sem frete

    # Informações adicionais
    informacoes_complementares: Optional[str] = None
    informacoes_fisco: Optional[str] = None

    # Referência
    order_id: Optional[str] = None
    sale_id: Optional[str] = None


@dataclass
class ItemEmissao:
    """Dados de um item para emissão"""
    codigo: str
    descricao: str
    ncm: str
    cfop: str
    unidade: str
    quantidade: Decimal
    valor_unitario: Decimal

    # Opcionais
    codigo_barras: Optional[str] = None
    cest: Optional[str] = None
    origem: str = "0"  # Nacional

    # Impostos
    icms_cst: str = "00"
    icms_base: Optional[Decimal] = None
    icms_aliquota: Optional[Decimal] = None
    icms_valor: Optional[Decimal] = None

    pis_cst: str = "01"
    pis_aliquota: Optional[Decimal] = None
    pis_valor: Optional[Decimal] = None

    cofins_cst: str = "01"
    cofins_aliquota: Optional[Decimal] = None
    cofins_valor: Optional[Decimal] = None

    ipi_cst: Optional[str] = None
    ipi_aliquota: Optional[Decimal] = None
    ipi_valor: Optional[Decimal] = None


class FiscalService:
    """
    Serviço principal de operações fiscais

    Métodos principais:
    - emitir_nfe: Emissão de NF-e completa
    - emitir_nfce: Emissão de NFC-e completa
    - cancelar_documento: Cancelamento de NF-e/NFC-e
    - carta_correcao: Emissão de CC-e
    - inutilizar_numeracao: Inutilização de faixa
    - consultar_documento: Consulta situação
    """

    def __init__(self):
        """Inicializa o serviço fiscal"""
        # Importa dependências internas
        try:
            from services.nfe_xml_builder import NFeXMLBuilder, NFeEventoBuilder, NFeInutilizacaoBuilder
            from services.certificate_service import get_certificate_manager
            from services.sefaz_service import SefazServiceFactory

            self.xml_builder = NFeXMLBuilder()
            self.evento_builder = NFeEventoBuilder()
            self.inutilizacao_builder = NFeInutilizacaoBuilder()
            self.cert_manager = get_certificate_manager()
            self.sefaz_factory = SefazServiceFactory

            self._services_loaded = True
        except ImportError as e:
            logger.warning(f"Serviços fiscais não carregados completamente: {e}")
            self._services_loaded = False

    def _validar_servicos(self) -> Tuple[bool, str]:
        """Verifica se todos os serviços necessários estão disponíveis"""
        if not self._services_loaded:
            return False, "Serviços fiscais não carregados. Verifique as dependências."
        return True, ""

    def emitir_nfe(self, dados: DadosEmissao) -> ResultadoEmissao:
        """
        Emite uma NF-e completa

        Fluxo:
        1. Valida dados de entrada
        2. Obtém empresa e certificado
        3. Obtém/incrementa numeração
        4. Calcula impostos
        5. Gera XML
        6. Assina XML
        7. Envia para SEFAZ
        8. Processa resposta
        9. Salva documento
        10. Notifica contador

        Args:
            dados: DadosEmissao com todos os dados necessários

        Returns:
            ResultadoEmissao
        """
        try:
            # Valida serviços
            ok, msg = self._validar_servicos()
            if not ok:
                return ResultadoEmissao(sucesso=False, mensagem=msg)

            # Importa modelos
            from models.fiscal import (
                EmpresaEmissora, SerieFiscal, DocumentoFiscal,
                ItemDocumentoFiscal, PagamentoDocumentoFiscal,
                AuditoriaFiscal, LogComunicacaoSefaz
            )

            # 1. Obtém empresa emissora
            empresa = EmpresaEmissora.query.get(dados.empresa_id)
            if not empresa:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem=f"Empresa não encontrada: {dados.empresa_id}"
                )

            if not empresa.is_active:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Empresa não está ativa"
                )

            # 2. Verifica certificado
            cert_service = self.cert_manager.obter_servico(str(empresa.id))
            if not cert_service or not cert_service.certificado_esta_valido():
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Certificado digital não disponível ou inválido",
                    erros=["Certificado digital não encontrado ou expirado"]
                )

            # 3. Obtém série e próximo número
            modelo = dados.modelo or "55"
            serie_fiscal = SerieFiscal.query.filter_by(
                empresa_id=empresa.id,
                modelo=modelo,
                ambiente=empresa.ambiente_atual,
                is_active=True,
                is_default=True
            ).first()

            if not serie_fiscal:
                # Cria série padrão se não existir
                serie_fiscal = SerieFiscal(
                    empresa_id=empresa.id,
                    modelo=modelo,
                    serie=1,
                    ambiente=empresa.ambiente_atual,
                    is_default=True
                )
                db.session.add(serie_fiscal)

            # Incrementa número
            numero = serie_fiscal.obter_proximo_numero()

            # 4. Valida dados obrigatórios
            erros_validacao = self._validar_dados_emissao(dados, modelo)
            if erros_validacao:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Dados inválidos para emissão",
                    erros=erros_validacao
                )

            # 5. Cria documento fiscal
            doc = DocumentoFiscal(
                empresa_id=empresa.id,
                serie_fiscal_id=serie_fiscal.id,
                modelo=modelo,
                serie=serie_fiscal.serie,
                numero=numero,
                tipo_operacao=dados.tipo_operacao,
                finalidade=dados.finalidade,
                tipo_emissao="1",  # Normal
                indicador_presenca=dados.indicador_presenca,
                ambiente=empresa.ambiente_atual,
                status="rascunho",
                data_emissao=datetime.utcnow()
            )

            # Destinatário
            doc.dest_tipo_pessoa = dados.dest_tipo_pessoa
            doc.dest_cpf = dados.dest_cpf
            doc.dest_cnpj = dados.dest_cnpj
            doc.dest_nome = dados.dest_nome
            doc.dest_email = dados.dest_email
            doc.dest_telefone = dados.dest_telefone
            doc.dest_ie = dados.dest_ie

            # Endereço
            doc.dest_logradouro = dados.dest_logradouro
            doc.dest_numero = dados.dest_numero
            doc.dest_complemento = dados.dest_complemento
            doc.dest_bairro = dados.dest_bairro
            doc.dest_cep = dados.dest_cep
            doc.dest_municipio = dados.dest_municipio
            doc.dest_codigo_municipio_ibge = dados.dest_codigo_municipio
            doc.dest_uf = dados.dest_uf

            # Transporte
            doc.modalidade_frete = dados.modalidade_frete

            # Informações adicionais
            doc.informacoes_complementares = dados.informacoes_complementares
            doc.informacoes_fisco = dados.informacoes_fisco

            # Referências
            doc.order_id = dados.order_id
            doc.sale_id = dados.sale_id

            # 6. Processa itens e calcula totais
            valor_produtos = Decimal('0')
            valor_icms_base = Decimal('0')
            valor_icms = Decimal('0')
            valor_pis = Decimal('0')
            valor_cofins = Decimal('0')
            valor_ipi = Decimal('0')

            for idx, item_dados in enumerate(dados.itens, 1):
                # Calcula impostos do item
                item_calculado = self._calcular_impostos_item(
                    item_dados, empresa.regime_tributario, dados.dest_uf, empresa.uf
                )

                item = ItemDocumentoFiscal(
                    documento_id=doc.id,
                    numero_item=idx,
                    codigo_produto=item_dados.get('codigo', str(idx)),
                    descricao=item_dados.get('descricao', 'Produto'),
                    ncm=item_dados.get('ncm', ''),
                    cfop=item_dados.get('cfop', '5102'),
                    unidade_comercial=item_dados.get('unidade', 'UN'),
                    quantidade_comercial=Decimal(str(item_dados.get('quantidade', 1))),
                    valor_unitario_comercial=Decimal(str(item_dados.get('valor_unitario', 0))),
                    unidade_tributavel=item_dados.get('unidade', 'UN'),
                    quantidade_tributavel=Decimal(str(item_dados.get('quantidade', 1))),
                    valor_unitario_tributavel=Decimal(str(item_dados.get('valor_unitario', 0))),
                    valor_total_bruto=item_calculado['valor_total'],
                    codigo_barras=item_dados.get('codigo_barras'),
                    cest=item_dados.get('cest'),
                    icms_origem=item_dados.get('origem', '0'),
                    icms_cst=item_calculado['icms_cst'],
                    icms_base=item_calculado['icms_base'],
                    icms_aliquota=item_calculado['icms_aliquota'],
                    icms_valor=item_calculado['icms_valor'],
                    pis_cst=item_calculado['pis_cst'],
                    pis_base=item_calculado['pis_base'],
                    pis_aliquota=item_calculado['pis_aliquota'],
                    pis_valor=item_calculado['pis_valor'],
                    cofins_cst=item_calculado['cofins_cst'],
                    cofins_base=item_calculado['cofins_base'],
                    cofins_aliquota=item_calculado['cofins_aliquota'],
                    cofins_valor=item_calculado['cofins_valor']
                )

                doc.itens.append(item)

                # Acumula totais
                valor_produtos += item_calculado['valor_total']
                valor_icms_base += item_calculado['icms_base']
                valor_icms += item_calculado['icms_valor']
                valor_pis += item_calculado['pis_valor']
                valor_cofins += item_calculado['cofins_valor']

            # Totais do documento
            doc.valor_produtos = valor_produtos
            doc.valor_icms_base = valor_icms_base
            doc.valor_icms = valor_icms
            doc.valor_pis = valor_pis
            doc.valor_cofins = valor_cofins
            doc.valor_ipi = valor_ipi
            doc.valor_total = valor_produtos  # + frete + outras despesas - desconto

            # 7. Processa pagamentos
            for pag_dados in dados.pagamentos:
                pag = PagamentoDocumentoFiscal(
                    documento_id=doc.id,
                    indicador_pagamento=pag_dados.get('indicador', '0'),
                    forma_pagamento=pag_dados.get('forma', '01'),
                    valor=Decimal(str(pag_dados.get('valor', 0))),
                    valor_troco=Decimal(str(pag_dados.get('troco', 0)))
                )
                doc.pagamentos.append(pag)

            # 8. Gera chave de acesso
            doc.gerar_chave_acesso()

            # 9. Gera XML
            try:
                xml_original = self.xml_builder.build_nfe(doc)
                doc.xml_original = xml_original
                doc.status = "rascunho"
            except Exception as e:
                logger.error(f"Erro ao gerar XML: {str(e)}")
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Erro ao gerar XML da NF-e",
                    erros=[str(e)]
                )

            # 10. Assina XML
            resultado_assinatura = self.cert_manager.assinar_xml_empresa(
                str(empresa.id), xml_original, tipo="nfe"
            )

            if not resultado_assinatura.sucesso:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Erro ao assinar XML",
                    erros=[resultado_assinatura.erro]
                )

            doc.xml_assinado = resultado_assinatura.xml_assinado
            doc.status = "assinado"

            # 11. Envia para SEFAZ
            sefaz = self.sefaz_factory.criar_servico(
                uf=empresa.uf,
                ambiente=empresa.ambiente_atual
            )

            resultado_sefaz = sefaz.autorizar_nfe(doc.xml_assinado, sincrono=True)

            # 12. Log de comunicação
            log = LogComunicacaoSefaz(
                empresa_id=empresa.id,
                documento_id=doc.id,
                tipo_operacao="autorizacao",
                ambiente=empresa.ambiente_atual,
                webservice="NfeAutorizacao",
                url="",
                xml_envio=resultado_sefaz.xml_enviado,
                xml_retorno=resultado_sefaz.xml_retorno,
                data_envio=datetime.utcnow(),
                data_retorno=datetime.utcnow(),
                tempo_resposta_ms=resultado_sefaz.tempo_resposta_ms,
                sucesso=resultado_sefaz.sucesso,
                codigo_status=resultado_sefaz.codigo_status,
                motivo=resultado_sefaz.motivo
            )
            db.session.add(log)

            # 13. Processa resultado
            if resultado_sefaz.sucesso:
                doc.status = "autorizado"
                doc.protocolo_autorizacao = resultado_sefaz.protocolo
                doc.data_autorizacao = resultado_sefaz.data_recebimento or datetime.utcnow()
                doc.motivo_autorizacao = resultado_sefaz.motivo
                doc.xml_protocolo = resultado_sefaz.xml_retorno

                # Salva no banco
                db.session.add(doc)
                db.session.commit()

                # Registra auditoria
                self._registrar_auditoria(
                    entidade="documento_fiscal",
                    entidade_id=doc.id,
                    operacao="emissao_autorizada",
                    dados_novos={'chave_acesso': doc.chave_acesso, 'protocolo': doc.protocolo_autorizacao}
                )

                # TODO: Enviar para contador
                # TODO: Gerar DANFE PDF

                return ResultadoEmissao(
                    sucesso=True,
                    mensagem="NF-e autorizada com sucesso",
                    documento_id=str(doc.id),
                    chave_acesso=doc.chave_acesso,
                    numero_nota=doc.numero,
                    serie=doc.serie,
                    protocolo=doc.protocolo_autorizacao,
                    data_autorizacao=doc.data_autorizacao,
                    xml_autorizado=doc.xml_protocolo
                )
            else:
                doc.status = "rejeitado"
                doc.motivo_autorizacao = resultado_sefaz.motivo

                db.session.add(doc)
                db.session.commit()

                return ResultadoEmissao(
                    sucesso=False,
                    mensagem=f"NF-e rejeitada pela SEFAZ: {resultado_sefaz.motivo}",
                    documento_id=str(doc.id),
                    chave_acesso=doc.chave_acesso,
                    numero_nota=doc.numero,
                    serie=doc.serie,
                    erros=[f"cStat {resultado_sefaz.codigo_status}: {resultado_sefaz.motivo}"]
                )

        except Exception as e:
            logger.error(f"Erro na emissão de NF-e: {str(e)}")
            db.session.rollback()
            return ResultadoEmissao(
                sucesso=False,
                mensagem="Erro interno na emissão",
                erros=[str(e)]
            )

    def emitir_nfce(self, dados: DadosEmissao) -> ResultadoEmissao:
        """
        Emite uma NFC-e (Nota Fiscal de Consumidor Eletrônica)

        Similar à NF-e, mas com regras específicas para consumidor final
        """
        # Define modelo como NFC-e
        dados.modelo = "65"
        dados.indicador_presenca = "1"  # Presencial

        # NFC-e permite destinatário sem identificação
        if not dados.dest_cpf and not dados.dest_cnpj:
            dados.dest_tipo_pessoa = None

        return self.emitir_nfe(dados)

    def cancelar_documento(
        self,
        documento_id: str,
        justificativa: str
    ) -> ResultadoEmissao:
        """
        Cancela um documento fiscal autorizado

        Prazo: 24 horas após autorização (NF-e) ou 30 minutos (NFC-e)

        Args:
            documento_id: ID do documento
            justificativa: Motivo do cancelamento (15-255 caracteres)

        Returns:
            ResultadoEmissao
        """
        try:
            from models.fiscal import DocumentoFiscal, EventoDocumentoFiscal

            # Valida justificativa
            if not justificativa or len(justificativa) < 15:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Justificativa deve ter pelo menos 15 caracteres"
                )

            if len(justificativa) > 255:
                justificativa = justificativa[:255]

            # Obtém documento
            doc = DocumentoFiscal.query.get(documento_id)
            if not doc:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Documento não encontrado"
                )

            if doc.status != "autorizado":
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem=f"Documento não pode ser cancelado. Status atual: {doc.status}"
                )

            # Verifica prazo
            prazo_horas = 24 if doc.modelo == "55" else 0.5  # 30 min para NFC-e
            limite = doc.data_autorizacao + timedelta(hours=prazo_horas)
            if datetime.utcnow() > limite:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem=f"Prazo para cancelamento expirado. Limite: {limite.isoformat()}"
                )

            # Gera XML do evento
            xml_evento = self.evento_builder.build_evento_cancelamento(
                doc, justificativa, sequencia=1
            )

            # Assina
            resultado_assinatura = self.cert_manager.assinar_xml_empresa(
                str(doc.empresa_id), xml_evento, tipo="evento"
            )

            if not resultado_assinatura.sucesso:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Erro ao assinar evento de cancelamento",
                    erros=[resultado_assinatura.erro]
                )

            # Envia para SEFAZ
            empresa = doc.empresa
            sefaz = self.sefaz_factory.criar_servico(
                uf=empresa.uf,
                ambiente=empresa.ambiente_atual
            )

            resultado_sefaz = sefaz.enviar_evento(resultado_assinatura.xml_assinado)

            # Registra evento
            evento = EventoDocumentoFiscal(
                documento_id=doc.id,
                tipo_evento="110111",
                sequencia=1,
                descricao_evento="Cancelamento",
                data_evento=datetime.utcnow(),
                justificativa=justificativa,
                xml_evento=resultado_assinatura.xml_assinado,
                xml_retorno=resultado_sefaz.xml_retorno,
                protocolo=resultado_sefaz.protocolo,
                codigo_status=resultado_sefaz.codigo_status,
                motivo=resultado_sefaz.motivo,
                status="autorizado" if resultado_sefaz.sucesso else "rejeitado"
            )
            db.session.add(evento)

            if resultado_sefaz.sucesso:
                doc.status = "cancelado"
                doc.protocolo_cancelamento = resultado_sefaz.protocolo
                doc.data_cancelamento = datetime.utcnow()
                doc.motivo_cancelamento = resultado_sefaz.motivo
                doc.justificativa_cancelamento = justificativa
                doc.xml_cancelamento = resultado_sefaz.xml_retorno

                db.session.commit()

                return ResultadoEmissao(
                    sucesso=True,
                    mensagem="Documento cancelado com sucesso",
                    documento_id=str(doc.id),
                    chave_acesso=doc.chave_acesso,
                    protocolo=resultado_sefaz.protocolo
                )
            else:
                db.session.commit()
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem=f"Cancelamento rejeitado: {resultado_sefaz.motivo}",
                    erros=[f"cStat {resultado_sefaz.codigo_status}: {resultado_sefaz.motivo}"]
                )

        except Exception as e:
            logger.error(f"Erro no cancelamento: {str(e)}")
            db.session.rollback()
            return ResultadoEmissao(
                sucesso=False,
                mensagem="Erro no cancelamento",
                erros=[str(e)]
            )

    def carta_correcao(
        self,
        documento_id: str,
        texto_correcao: str
    ) -> ResultadoEmissao:
        """
        Emite Carta de Correção Eletrônica (CC-e)

        Limitações:
        - Máximo 20 correções por documento
        - Texto entre 15 e 1000 caracteres
        - Não pode corrigir valores, CFOP, quantidades

        Args:
            documento_id: ID do documento
            texto_correcao: Texto da correção

        Returns:
            ResultadoEmissao
        """
        try:
            from models.fiscal import DocumentoFiscal, CartaCorrecao

            # Valida texto
            if not texto_correcao or len(texto_correcao) < 15:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Texto da correção deve ter pelo menos 15 caracteres"
                )

            if len(texto_correcao) > 1000:
                texto_correcao = texto_correcao[:1000]

            # Obtém documento
            doc = DocumentoFiscal.query.get(documento_id)
            if not doc:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Documento não encontrado"
                )

            if doc.status != "autorizado":
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Só é possível emitir CC-e para documentos autorizados"
                )

            # Verifica limite de correções
            total_correcoes = CartaCorrecao.query.filter_by(documento_id=doc.id).count()
            if total_correcoes >= 20:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Limite de 20 correções atingido"
                )

            sequencia = total_correcoes + 1

            # Gera XML
            xml_evento = self.evento_builder.build_evento_carta_correcao(
                doc, texto_correcao, sequencia
            )

            # Assina
            resultado_assinatura = self.cert_manager.assinar_xml_empresa(
                str(doc.empresa_id), xml_evento, tipo="evento"
            )

            if not resultado_assinatura.sucesso:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Erro ao assinar carta de correção",
                    erros=[resultado_assinatura.erro]
                )

            # Envia
            empresa = doc.empresa
            sefaz = self.sefaz_factory.criar_servico(
                uf=empresa.uf,
                ambiente=empresa.ambiente_atual
            )

            resultado_sefaz = sefaz.enviar_evento(resultado_assinatura.xml_assinado)

            # Registra CC-e
            cce = CartaCorrecao(
                documento_id=doc.id,
                sequencia=sequencia,
                texto_correcao=texto_correcao,
                xml_carta=resultado_assinatura.xml_assinado,
                xml_retorno=resultado_sefaz.xml_retorno,
                protocolo=resultado_sefaz.protocolo,
                codigo_status=resultado_sefaz.codigo_status,
                motivo=resultado_sefaz.motivo,
                status="autorizado" if resultado_sefaz.sucesso else "rejeitado"
            )
            db.session.add(cce)

            if resultado_sefaz.sucesso:
                doc.tem_carta_correcao = True
                doc.sequencia_carta_correcao = sequencia
                db.session.commit()

                return ResultadoEmissao(
                    sucesso=True,
                    mensagem=f"Carta de Correção nº {sequencia} registrada com sucesso",
                    documento_id=str(doc.id),
                    chave_acesso=doc.chave_acesso,
                    protocolo=resultado_sefaz.protocolo
                )
            else:
                db.session.commit()
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem=f"CC-e rejeitada: {resultado_sefaz.motivo}",
                    erros=[f"cStat {resultado_sefaz.codigo_status}: {resultado_sefaz.motivo}"]
                )

        except Exception as e:
            logger.error(f"Erro na carta de correção: {str(e)}")
            db.session.rollback()
            return ResultadoEmissao(
                sucesso=False,
                mensagem="Erro na carta de correção",
                erros=[str(e)]
            )

    def consultar_documento(self, chave_acesso: str) -> ResultadoEmissao:
        """
        Consulta situação de documento na SEFAZ

        Args:
            chave_acesso: Chave de 44 dígitos

        Returns:
            ResultadoEmissao com situação atual
        """
        try:
            from models.fiscal import DocumentoFiscal

            # Valida chave
            if not chave_acesso or len(chave_acesso) != 44:
                return ResultadoEmissao(
                    sucesso=False,
                    mensagem="Chave de acesso inválida"
                )

            # Obtém documento local
            doc = DocumentoFiscal.query.filter_by(chave_acesso=chave_acesso).first()

            if doc:
                uf = doc.empresa.uf
                ambiente = doc.ambiente
            else:
                # Extrai UF da chave
                uf_codigo = chave_acesso[:2]
                uf_map = {
                    "35": "SP", "31": "MG", "33": "RJ", "43": "RS",
                    "41": "PR", "42": "SC"
                }
                uf = uf_map.get(uf_codigo, "SP")
                ambiente = "2"  # Assume homologação

            # Consulta SEFAZ
            sefaz = self.sefaz_factory.criar_servico(uf=uf, ambiente=ambiente)
            resultado = sefaz.consultar_protocolo(chave_acesso)

            return ResultadoEmissao(
                sucesso=resultado.sucesso,
                mensagem=resultado.motivo,
                chave_acesso=chave_acesso,
                protocolo=resultado.protocolo,
                data_autorizacao=resultado.data_recebimento
            )

        except Exception as e:
            logger.error(f"Erro na consulta: {str(e)}")
            return ResultadoEmissao(
                sucesso=False,
                mensagem="Erro na consulta",
                erros=[str(e)]
            )

    def _validar_dados_emissao(self, dados: DadosEmissao, modelo: str) -> List[str]:
        """Valida dados de emissão"""
        erros = []

        # Valida itens
        if not dados.itens:
            erros.append("Nenhum item informado")

        for idx, item in enumerate(dados.itens, 1):
            if not item.get('descricao'):
                erros.append(f"Item {idx}: descrição obrigatória")
            if not item.get('ncm'):
                erros.append(f"Item {idx}: NCM obrigatório")
            if not item.get('cfop'):
                erros.append(f"Item {idx}: CFOP obrigatório")
            if item.get('quantidade', 0) <= 0:
                erros.append(f"Item {idx}: quantidade deve ser maior que zero")
            if item.get('valor_unitario', 0) <= 0:
                erros.append(f"Item {idx}: valor unitário deve ser maior que zero")

        # NF-e requer destinatário identificado
        if modelo == "55":
            if not dados.dest_cpf and not dados.dest_cnpj:
                erros.append("Destinatário obrigatório para NF-e")
            if not dados.dest_nome:
                erros.append("Nome do destinatário obrigatório para NF-e")

        # Valida pagamentos
        if not dados.pagamentos:
            erros.append("Forma de pagamento obrigatória")

        return erros

    def _calcular_impostos_item(
        self,
        item: Dict,
        regime_tributario: str,
        uf_destino: str,
        uf_origem: str
    ) -> Dict:
        """
        Calcula impostos de um item

        Considera regime tributário e operação interna/interestadual
        """
        quantidade = Decimal(str(item.get('quantidade', 1)))
        valor_unitario = Decimal(str(item.get('valor_unitario', 0)))
        valor_total = (quantidade * valor_unitario).quantize(Decimal('0.01'), ROUND_HALF_UP)

        # Alíquotas padrão
        if regime_tributario == "1":  # Simples Nacional
            icms_cst = "102"  # CSOSN - Tributação SN sem permissão de crédito
            icms_aliquota = Decimal('0')
            icms_valor = Decimal('0')
            pis_cst = "99"
            cofins_cst = "99"
        else:
            # Regime normal
            icms_cst = item.get('icms_cst', '00')

            # Alíquota ICMS baseada em UF
            if uf_origem == uf_destino:
                # Operação interna
                aliquotas_internas = {
                    "SP": Decimal('18'),
                    "MG": Decimal('18'),
                    "RJ": Decimal('20'),
                    "RS": Decimal('17'),
                    "PR": Decimal('19'),
                    "SC": Decimal('17'),
                }
                icms_aliquota = aliquotas_internas.get(uf_origem, Decimal('18'))
            else:
                # Interestadual
                icms_aliquota = Decimal('12')

            icms_valor = (valor_total * icms_aliquota / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
            pis_cst = "01"
            cofins_cst = "01"

        # PIS e COFINS (não cumulativo)
        pis_aliquota = Decimal('1.65')
        cofins_aliquota = Decimal('7.60')
        pis_valor = (valor_total * pis_aliquota / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)
        cofins_valor = (valor_total * cofins_aliquota / 100).quantize(Decimal('0.01'), ROUND_HALF_UP)

        return {
            'valor_total': valor_total,
            'icms_cst': icms_cst,
            'icms_base': valor_total,
            'icms_aliquota': icms_aliquota,
            'icms_valor': icms_valor,
            'pis_cst': pis_cst,
            'pis_base': valor_total,
            'pis_aliquota': pis_aliquota,
            'pis_valor': pis_valor,
            'cofins_cst': cofins_cst,
            'cofins_base': valor_total,
            'cofins_aliquota': cofins_aliquota,
            'cofins_valor': cofins_valor
        }

    def _registrar_auditoria(
        self,
        entidade: str,
        entidade_id,
        operacao: str,
        dados_anteriores: Dict = None,
        dados_novos: Dict = None,
        usuario_id=None
    ):
        """Registra operação na auditoria fiscal"""
        try:
            from models.fiscal import AuditoriaFiscal

            auditoria = AuditoriaFiscal(
                entidade=entidade,
                entidade_id=entidade_id,
                operacao=operacao,
                dados_anteriores=dados_anteriores,
                dados_novos=dados_novos,
                usuario_id=usuario_id,
                data_hora=datetime.utcnow()
            )
            auditoria.calcular_hash()
            db.session.add(auditoria)
        except Exception as e:
            logger.error(f"Erro ao registrar auditoria: {str(e)}")


# Singleton do serviço fiscal
_fiscal_service: Optional[FiscalService] = None


def get_fiscal_service() -> FiscalService:
    """Obtém instância singleton do serviço fiscal"""
    global _fiscal_service
    if _fiscal_service is None:
        _fiscal_service = FiscalService()
    return _fiscal_service
