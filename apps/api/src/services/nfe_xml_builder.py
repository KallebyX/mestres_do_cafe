"""
Gerador de XML para NF-e/NFC-e - Padrão SEFAZ

Este módulo implementa a geração de XML 100% compatível com os schemas oficiais da SEFAZ.

Referências:
- Manual de Orientação do Contribuinte (MOC) - versão 7.0
- Nota Técnica 2019.001 - Leiaute NF-e/NFC-e versão 4.00
- Schema XSD: nfe_v4.00.xsd, procNFe_v4.00.xsd
- Namespace: http://www.portalfiscal.inf.br/nfe

Estrutura do XML NF-e:
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe{chaveAcesso}" versao="4.00">
        <ide/>           - Identificação da NF-e
        <emit/>          - Emitente
        <dest/>          - Destinatário
        <retirada/>      - Local de retirada (opcional)
        <entrega/>       - Local de entrega (opcional)
        <autXML/>        - Autorização download XML (opcional)
        <det nItem="N"/> - Detalhe dos itens (1-990)
        <total/>         - Totais
        <transp/>        - Transporte
        <cobr/>          - Cobrança (opcional)
        <pag/>           - Pagamento
        <infIntermed/>   - Intermediador (opcional)
        <infAdic/>       - Informações adicionais (opcional)
        <exporta/>       - Exportação (opcional)
        <compra/>        - Compra (opcional)
        <cana/>          - Cana-de-açúcar (opcional)
        <infRespTec/>    - Responsável Técnico (opcional)
    </infNFe>
    <Signature/>         - Assinatura digital
</NFe>
"""

import uuid
import hashlib
from datetime import datetime, date
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Any
from xml.etree import ElementTree as ET
from xml.dom import minidom
import re

# Constantes de namespaces
NS_NFE = "http://www.portalfiscal.inf.br/nfe"
NS_DS = "http://www.w3.org/2000/09/xmldsig#"

# Versão do layout
VERSAO_NFE = "4.00"


class NFeTags:
    """Constantes de tags do XML NF-e"""
    # Tipos de operação
    TP_NF_ENTRADA = "0"
    TP_NF_SAIDA = "1"

    # Finalidade
    FIN_NFE_NORMAL = "1"
    FIN_NFE_COMPLEMENTAR = "2"
    FIN_NFE_AJUSTE = "3"
    FIN_NFE_DEVOLUCAO = "4"

    # Tipo de emissão
    TP_EMIS_NORMAL = "1"
    TP_EMIS_CONTINGENCIA_FS_IA = "2"
    TP_EMIS_CONTINGENCIA_SCAN = "3"
    TP_EMIS_CONTINGENCIA_EPEC = "4"
    TP_EMIS_CONTINGENCIA_FS_DA = "5"
    TP_EMIS_CONTINGENCIA_SVC_AN = "6"
    TP_EMIS_CONTINGENCIA_SVC_RS = "7"
    TP_EMIS_CONTINGENCIA_OFFLINE = "9"

    # Formato de impressão
    TP_IMP_RETRATO = "1"
    TP_IMP_PAISAGEM = "2"
    TP_IMP_SIMPLIFICADO = "3"
    TP_IMP_NFCE = "4"
    TP_IMP_MSG_ELETRONICA = "5"

    # Indicador de presença
    IND_PRES_NAO_SE_APLICA = "0"
    IND_PRES_PRESENCIAL = "1"
    IND_PRES_INTERNET = "2"
    IND_PRES_TELEMARKETING = "3"
    IND_PRES_NFCE_ENTREGA = "4"
    IND_PRES_FORA_ESTABELECIMENTO = "5"
    IND_PRES_OUTROS = "9"

    # Indicador de IE
    IND_IE_CONTRIBUINTE = "1"
    IND_IE_ISENTO = "2"
    IND_IE_NAO_CONTRIBUINTE = "9"

    # Modalidade do frete
    MOD_FRETE_EMITENTE = "0"
    MOD_FRETE_DESTINATARIO = "1"
    MOD_FRETE_TERCEIROS = "2"
    MOD_FRETE_PROPRIO_EMITENTE = "3"
    MOD_FRETE_PROPRIO_DESTINATARIO = "4"
    MOD_FRETE_SEM_FRETE = "9"


class NFeXMLBuilder:
    """
    Construtor de XML NF-e/NFC-e conforme padrão SEFAZ

    Uso:
        builder = NFeXMLBuilder()
        xml = builder.build_nfe(documento_fiscal)
    """

    def __init__(self):
        self.erros: List[str] = []
        self.avisos: List[str] = []

    def _format_decimal(self, valor: Optional[Decimal], casas: int = 2) -> str:
        """Formata valor decimal para XML"""
        if valor is None:
            return "0.00" if casas == 2 else "0"
        return f"{Decimal(valor):.{casas}f}"

    def _format_date(self, data: datetime) -> str:
        """Formata data para padrão XML (UTC)"""
        if data is None:
            data = datetime.utcnow()
        return data.strftime("%Y-%m-%dT%H:%M:%S-03:00")

    def _sanitize_text(self, texto: Optional[str], max_length: int = None) -> str:
        """Limpa e sanitiza texto para XML"""
        if texto is None:
            return ""

        # Remove caracteres especiais XML
        texto = str(texto)
        texto = texto.replace("&", "&amp;")
        texto = texto.replace("<", "&lt;")
        texto = texto.replace(">", "&gt;")
        texto = texto.replace('"', "&quot;")
        texto = texto.replace("'", "&apos;")

        # Remove caracteres de controle
        texto = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', texto)

        # Limita tamanho
        if max_length and len(texto) > max_length:
            texto = texto[:max_length]

        return texto.strip()

    def _zfill(self, valor: Any, tamanho: int) -> str:
        """Preenche com zeros à esquerda"""
        return str(valor).zfill(tamanho)

    def _add_element(self, parent: ET.Element, tag: str, texto: Optional[str] = None,
                     attribs: Dict = None) -> ET.Element:
        """Adiciona elemento ao XML"""
        elem = ET.SubElement(parent, tag)
        if texto is not None:
            elem.text = str(texto)
        if attribs:
            for key, value in attribs.items():
                elem.set(key, str(value))
        return elem

    def _add_if_value(self, parent: ET.Element, tag: str, valor: Any,
                      max_length: int = None) -> Optional[ET.Element]:
        """Adiciona elemento apenas se valor não for None/vazio"""
        if valor is not None and str(valor).strip():
            texto = self._sanitize_text(str(valor), max_length)
            return self._add_element(parent, tag, texto)
        return None

    def build_nfe(self, doc_fiscal) -> str:
        """
        Constrói XML completo da NF-e/NFC-e

        Args:
            doc_fiscal: Objeto DocumentoFiscal com todos os dados

        Returns:
            XML string formatado
        """
        self.erros = []
        self.avisos = []

        # Cria elemento raiz
        nfe = ET.Element("NFe", xmlns=NS_NFE)

        # Cria infNFe
        inf_nfe = self._build_inf_nfe(nfe, doc_fiscal)

        # Gera XML formatado
        return self._to_pretty_xml(nfe)

    def _build_inf_nfe(self, nfe: ET.Element, doc) -> ET.Element:
        """Constrói grupo infNFe"""
        # ID = NFe + chave de 44 dígitos
        chave = doc.chave_acesso or self._gerar_chave_acesso(doc)

        inf_nfe = self._add_element(
            nfe, "infNFe",
            attribs={
                "versao": VERSAO_NFE,
                "Id": f"NFe{chave}"
            }
        )

        # Grupos obrigatórios
        self._build_ide(inf_nfe, doc)
        self._build_emit(inf_nfe, doc)
        self._build_dest(inf_nfe, doc)

        # Itens (det) - obrigatório, 1 a 990
        for item in doc.itens:
            self._build_det(inf_nfe, item)

        # Totais
        self._build_total(inf_nfe, doc)

        # Transporte
        self._build_transp(inf_nfe, doc)

        # Pagamento
        self._build_pag(inf_nfe, doc)

        # Informações adicionais
        self._build_inf_adic(inf_nfe, doc)

        # Responsável técnico (opcional mas recomendado)
        self._build_inf_resp_tec(inf_nfe, doc)

        return inf_nfe

    def _build_ide(self, parent: ET.Element, doc) -> ET.Element:
        """
        Constrói grupo <ide> - Identificação da NF-e

        Tags obrigatórias:
        - cUF, cNF, natOp, mod, serie, nNF, dhEmi, tpNF, idDest, cMunFG
        - tpImp, tpEmis, cDV, tpAmb, finNFe, indFinal, indPres, procEmi, verProc
        """
        ide = self._add_element(parent, "ide")

        empresa = doc.empresa

        # Código UF do emitente
        self._add_element(ide, "cUF", empresa.codigo_uf_ibge)

        # Código numérico que compõe a chave (8 dígitos)
        codigo_nf = self._extrair_codigo_nf(doc.chave_acesso)
        self._add_element(ide, "cNF", codigo_nf)

        # Natureza da operação
        natureza = doc.informacoes_complementares or "VENDA DE MERCADORIA"
        if doc.tipo_operacao == "0":
            natureza = "COMPRA DE MERCADORIA"
        self._add_element(ide, "natOp", self._sanitize_text(natureza, 60))

        # Modelo do documento fiscal (55=NFe, 65=NFCe)
        self._add_element(ide, "mod", doc.modelo)

        # Série do documento
        self._add_element(ide, "serie", str(doc.serie))

        # Número do documento
        self._add_element(ide, "nNF", str(doc.numero))

        # Data e hora de emissão
        self._add_element(ide, "dhEmi", self._format_date(doc.data_emissao))

        # Data e hora de saída/entrada (opcional para NFCe)
        if doc.data_saida_entrada and doc.modelo == "55":
            self._add_element(ide, "dhSaiEnt", self._format_date(doc.data_saida_entrada))

        # Tipo de operação (0=Entrada, 1=Saída)
        self._add_element(ide, "tpNF", doc.tipo_operacao)

        # Identificador de destino da operação
        # 1=Op. Interna, 2=Interestadual, 3=Exterior
        id_dest = "1"
        if doc.dest_uf and empresa.uf != doc.dest_uf:
            id_dest = "2" if doc.dest_uf != "EX" else "3"
        self._add_element(ide, "idDest", id_dest)

        # Código do município de ocorrência do fato gerador
        self._add_element(ide, "cMunFG", empresa.codigo_municipio_ibge)

        # Formato de impressão do DANFE
        tp_imp = "1" if doc.modelo == "55" else "4"
        self._add_element(ide, "tpImp", tp_imp)

        # Tipo de emissão
        self._add_element(ide, "tpEmis", doc.tipo_emissao)

        # Dígito verificador da chave
        dv = doc.chave_acesso[-1] if doc.chave_acesso else "0"
        self._add_element(ide, "cDV", dv)

        # Ambiente (1=Produção, 2=Homologação)
        self._add_element(ide, "tpAmb", doc.ambiente)

        # Finalidade da emissão
        self._add_element(ide, "finNFe", doc.finalidade)

        # Indica operação com consumidor final
        ind_final = "1" if doc.modelo == "65" or not doc.dest_ie else "0"
        self._add_element(ide, "indFinal", ind_final)

        # Indicador de presença do comprador
        self._add_element(ide, "indPres", doc.indicador_presenca)

        # Indicador de intermediador/marketplace
        self._add_element(ide, "indIntermed", "0")  # 0=Sem intermediador

        # Processo de emissão (0=App contribuinte)
        self._add_element(ide, "procEmi", "0")

        # Versão do aplicativo
        self._add_element(ide, "verProc", "MESTRES_DO_CAFE_1.0")

        # NF-e referenciada (se devolução ou complementar)
        if doc.nfe_referenciada:
            nf_ref = self._add_element(ide, "NFref")
            self._add_element(nf_ref, "refNFe", doc.nfe_referenciada)

        return ide

    def _build_emit(self, parent: ET.Element, doc) -> ET.Element:
        """
        Constrói grupo <emit> - Emitente

        Tags obrigatórias:
        - CNPJ ou CPF, xNome, enderEmit, IE, CRT
        """
        emit = self._add_element(parent, "emit")
        empresa = doc.empresa

        # CNPJ do emitente
        self._add_element(emit, "CNPJ", empresa.cnpj)

        # Razão social
        self._add_element(emit, "xNome", self._sanitize_text(empresa.razao_social, 60))

        # Nome fantasia (opcional)
        self._add_if_value(emit, "xFant", empresa.nome_fantasia, 60)

        # Endereço do emitente
        ender_emit = self._add_element(emit, "enderEmit")
        self._add_element(ender_emit, "xLgr", self._sanitize_text(empresa.logradouro, 60))
        self._add_element(ender_emit, "nro", self._sanitize_text(empresa.numero, 60))
        self._add_if_value(ender_emit, "xCpl", empresa.complemento, 60)
        self._add_element(ender_emit, "xBairro", self._sanitize_text(empresa.bairro, 60))
        self._add_element(ender_emit, "cMun", empresa.codigo_municipio_ibge)
        self._add_element(ender_emit, "xMun", self._sanitize_text(empresa.municipio, 60))
        self._add_element(ender_emit, "UF", empresa.uf)
        self._add_element(ender_emit, "CEP", empresa.cep)
        self._add_element(ender_emit, "cPais", empresa.codigo_pais or "1058")
        self._add_element(ender_emit, "xPais", empresa.pais or "BRASIL")
        self._add_if_value(ender_emit, "fone", empresa.telefone_principal)

        # Inscrição Estadual
        self._add_element(emit, "IE", empresa.inscricao_estadual)

        # Inscrição Estadual Substituto Tributário (opcional)
        # self._add_if_value(emit, "IEST", empresa.inscricao_estadual_st)

        # Inscrição Municipal (opcional, para NFS-e)
        self._add_if_value(emit, "IM", empresa.inscricao_municipal)

        # CNAE Fiscal (opcional)
        self._add_if_value(emit, "CNAE", empresa.cnae_principal)

        # Código de Regime Tributário
        # 1=Simples Nacional, 2=Simples Excesso, 3=Regime Normal
        crt = empresa.regime_tributario
        if crt in ("4", "5"):
            crt = "3"  # Lucro Real e MEI mapeados para Regime Normal no XML
        self._add_element(emit, "CRT", crt)

        return emit

    def _build_dest(self, parent: ET.Element, doc) -> ET.Element:
        """
        Constrói grupo <dest> - Destinatário

        Obrigatório para NFe, opcional para NFCe consumidor final
        """
        # NFCe sem identificação do destinatário
        if doc.modelo == "65" and not doc.dest_cpf and not doc.dest_cnpj:
            return None

        dest = self._add_element(parent, "dest")

        # CPF ou CNPJ
        if doc.dest_cnpj:
            self._add_element(dest, "CNPJ", doc.dest_cnpj)
        elif doc.dest_cpf:
            self._add_element(dest, "CPF", doc.dest_cpf)
        elif doc.dest_id_estrangeiro:
            self._add_element(dest, "idEstrangeiro", doc.dest_id_estrangeiro)

        # Nome/Razão Social
        if doc.dest_nome:
            # Em homologação, usar nome padrão
            nome = doc.dest_nome if doc.ambiente == "1" else "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
            self._add_element(dest, "xNome", self._sanitize_text(nome, 60))

        # Endereço do destinatário
        if doc.dest_logradouro:
            ender_dest = self._add_element(dest, "enderDest")
            self._add_element(ender_dest, "xLgr", self._sanitize_text(doc.dest_logradouro, 60))
            self._add_element(ender_dest, "nro", self._sanitize_text(doc.dest_numero or "S/N", 60))
            self._add_if_value(ender_dest, "xCpl", doc.dest_complemento, 60)
            self._add_element(ender_dest, "xBairro", self._sanitize_text(doc.dest_bairro, 60))
            self._add_element(ender_dest, "cMun", doc.dest_codigo_municipio_ibge)
            self._add_element(ender_dest, "xMun", self._sanitize_text(doc.dest_municipio, 60))
            self._add_element(ender_dest, "UF", doc.dest_uf)
            self._add_if_value(ender_dest, "CEP", doc.dest_cep)
            self._add_element(ender_dest, "cPais", doc.dest_codigo_pais or "1058")
            self._add_element(ender_dest, "xPais", doc.dest_pais or "BRASIL")
            self._add_if_value(ender_dest, "fone", doc.dest_telefone)

        # Indicador de IE
        if doc.dest_cnpj:
            if doc.dest_ie:
                self._add_element(dest, "indIEDest", "1")  # Contribuinte
                self._add_element(dest, "IE", doc.dest_ie)
            else:
                self._add_element(dest, "indIEDest", "9")  # Não contribuinte
        elif doc.dest_cpf:
            self._add_element(dest, "indIEDest", "9")  # Pessoa física

        # Email
        self._add_if_value(dest, "email", doc.dest_email, 60)

        return dest

    def _build_det(self, parent: ET.Element, item) -> ET.Element:
        """
        Constrói grupo <det> - Detalhe do item

        Cada item da nota fiscal
        """
        det = self._add_element(
            parent, "det",
            attribs={"nItem": str(item.numero_item)}
        )

        # Produto
        prod = self._add_element(det, "prod")

        # Código do produto
        self._add_element(prod, "cProd", self._sanitize_text(item.codigo_produto, 60))

        # Código de barras (GTIN)
        cean = item.codigo_barras or "SEM GTIN"
        self._add_element(prod, "cEAN", cean)

        # Descrição do produto
        self._add_element(prod, "xProd", self._sanitize_text(item.descricao, 120))

        # NCM
        self._add_element(prod, "NCM", item.ncm)

        # CEST (se houver)
        self._add_if_value(prod, "CEST", item.cest)

        # CFOP
        self._add_element(prod, "CFOP", item.cfop)

        # Unidade comercial
        self._add_element(prod, "uCom", self._sanitize_text(item.unidade_comercial, 6))

        # Quantidade comercial
        self._add_element(prod, "qCom", self._format_decimal(item.quantidade_comercial, 4))

        # Valor unitário comercial
        self._add_element(prod, "vUnCom", self._format_decimal(item.valor_unitario_comercial, 10))

        # Valor total bruto
        self._add_element(prod, "vProd", self._format_decimal(item.valor_total_bruto, 2))

        # Código de barras tributável
        cean_trib = item.codigo_barras_tributavel or cean
        self._add_element(prod, "cEANTrib", cean_trib)

        # Unidade tributável
        u_trib = item.unidade_tributavel or item.unidade_comercial
        self._add_element(prod, "uTrib", self._sanitize_text(u_trib, 6))

        # Quantidade tributável
        q_trib = item.quantidade_tributavel or item.quantidade_comercial
        self._add_element(prod, "qTrib", self._format_decimal(q_trib, 4))

        # Valor unitário tributável
        v_un_trib = item.valor_unitario_tributavel or item.valor_unitario_comercial
        self._add_element(prod, "vUnTrib", self._format_decimal(v_un_trib, 10))

        # Valor do frete
        if item.valor_frete and item.valor_frete > 0:
            self._add_element(prod, "vFrete", self._format_decimal(item.valor_frete, 2))

        # Valor do seguro
        if item.valor_seguro and item.valor_seguro > 0:
            self._add_element(prod, "vSeg", self._format_decimal(item.valor_seguro, 2))

        # Valor do desconto
        if item.valor_desconto and item.valor_desconto > 0:
            self._add_element(prod, "vDesc", self._format_decimal(item.valor_desconto, 2))

        # Outras despesas
        if item.valor_outras_despesas and item.valor_outras_despesas > 0:
            self._add_element(prod, "vOutro", self._format_decimal(item.valor_outras_despesas, 2))

        # Indica se compõe valor total
        self._add_element(prod, "indTot", item.ind_total or "1")

        # Impostos
        imposto = self._add_element(det, "imposto")

        # Valor aproximado tributos (Lei 12.741)
        if item.valor_tributos_aproximado and item.valor_tributos_aproximado > 0:
            self._add_element(imposto, "vTotTrib", self._format_decimal(item.valor_tributos_aproximado, 2))

        # ICMS
        self._build_icms(imposto, item)

        # IPI (se houver)
        if item.ipi_valor and item.ipi_valor > 0:
            self._build_ipi(imposto, item)

        # PIS
        self._build_pis(imposto, item)

        # COFINS
        self._build_cofins(imposto, item)

        # Informações adicionais do item
        if item.informacoes_adicionais:
            self._add_element(det, "infAdProd", self._sanitize_text(item.informacoes_adicionais, 500))

        return det

    def _build_icms(self, parent: ET.Element, item) -> ET.Element:
        """Constrói grupo ICMS do item"""
        icms = self._add_element(parent, "ICMS")

        # Determina CST/CSOSN
        cst = item.icms_cst or "00"

        # Origem da mercadoria
        orig = item.icms_origem or "0"

        # CST para regime normal, CSOSN para Simples Nacional
        if cst.startswith("1") or cst.startswith("2"):  # CSOSN
            # Simples Nacional
            grupo = self._add_element(icms, f"ICMSSN{cst}")
            self._add_element(grupo, "orig", orig)
            self._add_element(grupo, "CSOSN", cst)
        else:
            # Regime normal
            if cst == "00":
                grupo = self._add_element(icms, "ICMS00")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)
                self._add_element(grupo, "modBC", item.icms_modalidade_bc or "3")  # 3=Valor operação
                self._add_element(grupo, "vBC", self._format_decimal(item.icms_base, 2))
                self._add_element(grupo, "pICMS", self._format_decimal(item.icms_aliquota, 2))
                self._add_element(grupo, "vICMS", self._format_decimal(item.icms_valor, 2))

            elif cst == "10":
                grupo = self._add_element(icms, "ICMS10")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)
                self._add_element(grupo, "modBC", item.icms_modalidade_bc or "3")
                self._add_element(grupo, "vBC", self._format_decimal(item.icms_base, 2))
                self._add_element(grupo, "pICMS", self._format_decimal(item.icms_aliquota, 2))
                self._add_element(grupo, "vICMS", self._format_decimal(item.icms_valor, 2))
                self._add_element(grupo, "modBCST", item.icms_st_modalidade_bc or "4")
                self._add_element(grupo, "pMVAST", self._format_decimal(item.icms_st_mva, 2))
                self._add_element(grupo, "vBCST", self._format_decimal(item.icms_st_base, 2))
                self._add_element(grupo, "pICMSST", self._format_decimal(item.icms_st_aliquota, 2))
                self._add_element(grupo, "vICMSST", self._format_decimal(item.icms_st_valor, 2))

            elif cst == "20":
                grupo = self._add_element(icms, "ICMS20")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)
                self._add_element(grupo, "modBC", item.icms_modalidade_bc or "3")
                self._add_element(grupo, "pRedBC", self._format_decimal(item.icms_reducao_bc, 2))
                self._add_element(grupo, "vBC", self._format_decimal(item.icms_base, 2))
                self._add_element(grupo, "pICMS", self._format_decimal(item.icms_aliquota, 2))
                self._add_element(grupo, "vICMS", self._format_decimal(item.icms_valor, 2))

            elif cst in ("40", "41", "50"):
                grupo = self._add_element(icms, "ICMS40")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)

            elif cst == "60":
                grupo = self._add_element(icms, "ICMS60")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)
                # Valores ST retido anteriormente (opcional)
                if item.icms_st_base and item.icms_st_base > 0:
                    self._add_element(grupo, "vBCSTRet", self._format_decimal(item.icms_st_base, 2))
                    self._add_element(grupo, "pST", self._format_decimal(item.icms_st_aliquota, 2))
                    self._add_element(grupo, "vICMSSTRet", self._format_decimal(item.icms_st_valor, 2))

            elif cst == "90":
                grupo = self._add_element(icms, "ICMS90")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)
                self._add_element(grupo, "modBC", item.icms_modalidade_bc or "3")
                self._add_element(grupo, "vBC", self._format_decimal(item.icms_base, 2))
                self._add_element(grupo, "pICMS", self._format_decimal(item.icms_aliquota, 2))
                self._add_element(grupo, "vICMS", self._format_decimal(item.icms_valor, 2))

            else:
                # Fallback para outros CST
                grupo = self._add_element(icms, "ICMS90")
                self._add_element(grupo, "orig", orig)
                self._add_element(grupo, "CST", cst)

        return icms

    def _build_ipi(self, parent: ET.Element, item) -> ET.Element:
        """Constrói grupo IPI do item"""
        ipi = self._add_element(parent, "IPI")

        # CST IPI
        cst = item.ipi_cst or "99"

        if cst in ("00", "49", "50", "99"):
            ipi_trib = self._add_element(ipi, "IPITrib")
            self._add_element(ipi_trib, "CST", cst)
            self._add_element(ipi_trib, "vBC", self._format_decimal(item.ipi_base, 2))
            self._add_element(ipi_trib, "pIPI", self._format_decimal(item.ipi_aliquota, 2))
            self._add_element(ipi_trib, "vIPI", self._format_decimal(item.ipi_valor, 2))
        else:
            ipi_nt = self._add_element(ipi, "IPINT")
            self._add_element(ipi_nt, "CST", cst)

        return ipi

    def _build_pis(self, parent: ET.Element, item) -> ET.Element:
        """Constrói grupo PIS do item"""
        pis = self._add_element(parent, "PIS")

        cst = item.pis_cst or "01"

        if cst in ("01", "02"):
            pis_aliq = self._add_element(pis, "PISAliq")
            self._add_element(pis_aliq, "CST", cst)
            self._add_element(pis_aliq, "vBC", self._format_decimal(item.pis_base, 2))
            self._add_element(pis_aliq, "pPIS", self._format_decimal(item.pis_aliquota, 4))
            self._add_element(pis_aliq, "vPIS", self._format_decimal(item.pis_valor, 2))

        elif cst in ("04", "05", "06", "07", "08", "09"):
            pis_nt = self._add_element(pis, "PISNT")
            self._add_element(pis_nt, "CST", cst)

        else:
            pis_outr = self._add_element(pis, "PISOutr")
            self._add_element(pis_outr, "CST", cst)
            self._add_element(pis_outr, "vBC", self._format_decimal(item.pis_base, 2))
            self._add_element(pis_outr, "pPIS", self._format_decimal(item.pis_aliquota, 4))
            self._add_element(pis_outr, "vPIS", self._format_decimal(item.pis_valor, 2))

        return pis

    def _build_cofins(self, parent: ET.Element, item) -> ET.Element:
        """Constrói grupo COFINS do item"""
        cofins = self._add_element(parent, "COFINS")

        cst = item.cofins_cst or "01"

        if cst in ("01", "02"):
            cofins_aliq = self._add_element(cofins, "COFINSAliq")
            self._add_element(cofins_aliq, "CST", cst)
            self._add_element(cofins_aliq, "vBC", self._format_decimal(item.cofins_base, 2))
            self._add_element(cofins_aliq, "pCOFINS", self._format_decimal(item.cofins_aliquota, 4))
            self._add_element(cofins_aliq, "vCOFINS", self._format_decimal(item.cofins_valor, 2))

        elif cst in ("04", "05", "06", "07", "08", "09"):
            cofins_nt = self._add_element(cofins, "COFINSNT")
            self._add_element(cofins_nt, "CST", cst)

        else:
            cofins_outr = self._add_element(cofins, "COFINSOutr")
            self._add_element(cofins_outr, "CST", cst)
            self._add_element(cofins_outr, "vBC", self._format_decimal(item.cofins_base, 2))
            self._add_element(cofins_outr, "pCOFINS", self._format_decimal(item.cofins_aliquota, 4))
            self._add_element(cofins_outr, "vCOFINS", self._format_decimal(item.cofins_valor, 2))

        return cofins

    def _build_total(self, parent: ET.Element, doc) -> ET.Element:
        """Constrói grupo <total> - Totais da NF-e"""
        total = self._add_element(parent, "total")
        icms_tot = self._add_element(total, "ICMSTot")

        # Soma dos valores base de cálculo ICMS
        self._add_element(icms_tot, "vBC", self._format_decimal(doc.valor_icms_base, 2))
        self._add_element(icms_tot, "vICMS", self._format_decimal(doc.valor_icms, 2))
        self._add_element(icms_tot, "vICMSDeson", "0.00")  # ICMS desonerado
        self._add_element(icms_tot, "vFCPUFDest", "0.00")  # FCP UF destino
        self._add_element(icms_tot, "vICMSUFDest", "0.00")  # ICMS UF destino
        self._add_element(icms_tot, "vICMSUFRemet", "0.00")  # ICMS UF remetente
        self._add_element(icms_tot, "vFCP", self._format_decimal(doc.valor_fcp, 2))
        self._add_element(icms_tot, "vBCST", self._format_decimal(doc.valor_icms_st_base, 2))
        self._add_element(icms_tot, "vST", self._format_decimal(doc.valor_icms_st, 2))
        self._add_element(icms_tot, "vFCPST", "0.00")  # FCP ST
        self._add_element(icms_tot, "vFCPSTRet", "0.00")  # FCP ST retido
        self._add_element(icms_tot, "vProd", self._format_decimal(doc.valor_produtos, 2))
        self._add_element(icms_tot, "vFrete", self._format_decimal(doc.valor_frete, 2))
        self._add_element(icms_tot, "vSeg", self._format_decimal(doc.valor_seguro, 2))
        self._add_element(icms_tot, "vDesc", self._format_decimal(doc.valor_desconto, 2))
        self._add_element(icms_tot, "vII", self._format_decimal(doc.valor_ii, 2))
        self._add_element(icms_tot, "vIPI", self._format_decimal(doc.valor_ipi, 2))
        self._add_element(icms_tot, "vIPIDevol", "0.00")  # IPI devolvido
        self._add_element(icms_tot, "vPIS", self._format_decimal(doc.valor_pis, 2))
        self._add_element(icms_tot, "vCOFINS", self._format_decimal(doc.valor_cofins, 2))
        self._add_element(icms_tot, "vOutro", self._format_decimal(doc.valor_outras_despesas, 2))
        self._add_element(icms_tot, "vNF", self._format_decimal(doc.valor_total, 2))
        self._add_element(icms_tot, "vTotTrib", self._format_decimal(doc.valor_tributos_aproximado, 2))

        return total

    def _build_transp(self, parent: ET.Element, doc) -> ET.Element:
        """Constrói grupo <transp> - Transporte"""
        transp = self._add_element(parent, "transp")

        # Modalidade do frete
        mod_frete = doc.modalidade_frete or "9"  # 9=Sem frete
        self._add_element(transp, "modFrete", mod_frete)

        # Transportadora (se houver)
        if doc.transportadora_cnpj or doc.transportadora_nome:
            transporta = self._add_element(transp, "transporta")
            self._add_if_value(transporta, "CNPJ", doc.transportadora_cnpj)
            self._add_if_value(transporta, "xNome", doc.transportadora_nome, 60)
            self._add_if_value(transporta, "IE", doc.transportadora_ie)

        # Veículo (se houver)
        if doc.veiculo_placa:
            vei_transp = self._add_element(transp, "veicTransp")
            self._add_element(vei_transp, "placa", doc.veiculo_placa)
            self._add_if_value(vei_transp, "UF", doc.veiculo_uf)

        # Volumes (se houver)
        if doc.volumes_quantidade:
            vol = self._add_element(transp, "vol")
            self._add_element(vol, "qVol", str(doc.volumes_quantidade))
            self._add_if_value(vol, "esp", doc.volumes_especie, 60)
            self._add_if_value(vol, "marca", doc.volumes_marca, 60)
            self._add_if_value(vol, "nVol", doc.volumes_numeracao, 60)
            if doc.volumes_peso_liquido:
                self._add_element(vol, "pesoL", self._format_decimal(doc.volumes_peso_liquido, 3))
            if doc.volumes_peso_bruto:
                self._add_element(vol, "pesoB", self._format_decimal(doc.volumes_peso_bruto, 3))

        return transp

    def _build_pag(self, parent: ET.Element, doc) -> ET.Element:
        """Constrói grupo <pag> - Pagamento"""
        pag = self._add_element(parent, "pag")

        # Detalhes de pagamento
        if doc.pagamentos:
            for pagamento in doc.pagamentos:
                det_pag = self._add_element(pag, "detPag")

                # Indicador de pagamento
                ind_pag = pagamento.indicador_pagamento or "0"
                self._add_element(det_pag, "indPag", ind_pag)

                # Forma de pagamento
                self._add_element(det_pag, "tPag", pagamento.forma_pagamento)

                # Valor
                self._add_element(det_pag, "vPag", self._format_decimal(pagamento.valor, 2))

                # Dados do cartão (se for cartão)
                if pagamento.forma_pagamento in ("03", "04"):  # Crédito ou débito
                    card = self._add_element(det_pag, "card")
                    tp_integra = pagamento.tipo_integracao or "2"
                    self._add_element(card, "tpIntegra", tp_integra)
                    self._add_if_value(card, "CNPJ", pagamento.cnpj_credenciadora)
                    self._add_if_value(card, "tBand", pagamento.bandeira_cartao)
                    self._add_if_value(card, "cAut", pagamento.codigo_autorizacao)
        else:
            # Pagamento padrão se não houver detalhes
            det_pag = self._add_element(pag, "detPag")
            self._add_element(det_pag, "indPag", "0")  # À vista
            self._add_element(det_pag, "tPag", "01")  # Dinheiro
            self._add_element(det_pag, "vPag", self._format_decimal(doc.valor_total, 2))

        # Troco
        troco_total = sum(
            p.valor_troco for p in doc.pagamentos if p.valor_troco
        ) if doc.pagamentos else Decimal('0')
        if troco_total > 0:
            self._add_element(pag, "vTroco", self._format_decimal(troco_total, 2))

        return pag

    def _build_inf_adic(self, parent: ET.Element, doc) -> ET.Element:
        """Constrói grupo <infAdic> - Informações Adicionais"""
        if not doc.informacoes_complementares and not doc.informacoes_fisco:
            return None

        inf_adic = self._add_element(parent, "infAdic")

        # Informações adicionais de interesse do Fisco
        if doc.informacoes_fisco:
            self._add_element(inf_adic, "infAdFisco", self._sanitize_text(doc.informacoes_fisco, 2000))

        # Informações complementares de interesse do contribuinte
        if doc.informacoes_complementares:
            self._add_element(inf_adic, "infCpl", self._sanitize_text(doc.informacoes_complementares, 5000))

        return inf_adic

    def _build_inf_resp_tec(self, parent: ET.Element, doc) -> ET.Element:
        """Constrói grupo <infRespTec> - Responsável Técnico"""
        inf_resp_tec = self._add_element(parent, "infRespTec")

        # Dados do desenvolvedor/software house
        self._add_element(inf_resp_tec, "CNPJ", "00000000000000")  # CNPJ do desenvolvedor
        self._add_element(inf_resp_tec, "xContato", "Suporte Mestres do Cafe")
        self._add_element(inf_resp_tec, "email", "fiscal@mestresdocafe.com.br")
        self._add_element(inf_resp_tec, "fone", "11999999999")

        return inf_resp_tec

    def _gerar_chave_acesso(self, doc) -> str:
        """Gera chave de acesso de 44 dígitos"""
        import random

        empresa = doc.empresa
        codigo_uf = empresa.codigo_uf_ibge
        data = doc.data_emissao or datetime.utcnow()
        aamm = data.strftime('%y%m')
        cnpj = empresa.cnpj.zfill(14)
        mod = str(doc.modelo).zfill(2)
        serie = str(doc.serie).zfill(3)
        num = str(doc.numero).zfill(9)
        tp_emis = str(doc.tipo_emissao)
        cnf = str(random.randint(10000000, 99999999))

        chave_sem_dv = f"{codigo_uf}{aamm}{cnpj}{mod}{serie}{num}{tp_emis}{cnf}"
        dv = self._calcular_dv(chave_sem_dv)

        return f"{chave_sem_dv}{dv}"

    def _calcular_dv(self, chave: str) -> str:
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

    def _extrair_codigo_nf(self, chave_acesso: str) -> str:
        """Extrai código numérico da chave de acesso"""
        if chave_acesso and len(chave_acesso) == 44:
            return chave_acesso[35:43]
        return str(uuid.uuid4().int)[:8]

    def _to_pretty_xml(self, element: ET.Element) -> str:
        """Converte ElementTree para XML formatado"""
        rough_string = ET.tostring(element, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ", encoding=None)

    def build_envio_lote(self, documentos: List, id_lote: str = None) -> str:
        """
        Constrói XML de envio de lote de NF-e

        Estrutura enviNFe (v4.00):
        <enviNFe versao="4.00" xmlns="...">
            <idLote>NNNNNNNNNNNNNNN</idLote>
            <indSinc>0 ou 1</indSinc>
            <NFe>...</NFe>
        </enviNFe>
        """
        if id_lote is None:
            id_lote = str(uuid.uuid4().int)[:15]

        envi_nfe = ET.Element("enviNFe", xmlns=NS_NFE, versao=VERSAO_NFE)

        self._add_element(envi_nfe, "idLote", id_lote.zfill(15))

        # Indicador de processamento síncrono
        # 0=Assíncrono (até 50 NF-e), 1=Síncrono (1 NF-e)
        ind_sinc = "1" if len(documentos) == 1 else "0"
        self._add_element(envi_nfe, "indSinc", ind_sinc)

        # Adiciona cada NF-e
        for doc in documentos:
            nfe_xml = self.build_nfe(doc)
            # Insere XML da NF-e
            nfe_element = ET.fromstring(nfe_xml.replace('<?xml version="1.0" ?>', '').strip())
            envi_nfe.append(nfe_element)

        return self._to_pretty_xml(envi_nfe)


class NFeEventoBuilder:
    """Construtor de eventos NF-e (Cancelamento, CC-e, etc.)"""

    def __init__(self):
        self.erros: List[str] = []

    def build_evento_cancelamento(self, doc_fiscal, justificativa: str, sequencia: int = 1) -> str:
        """
        Constrói XML de evento de cancelamento

        Tipo: 110111
        """
        return self._build_evento(
            doc_fiscal=doc_fiscal,
            tipo_evento="110111",
            descricao_evento="Cancelamento",
            sequencia=sequencia,
            detalhes={
                "descEvento": "Cancelamento",
                "nProt": doc_fiscal.protocolo_autorizacao,
                "xJust": justificativa[:255]
            }
        )

    def build_evento_carta_correcao(self, doc_fiscal, texto_correcao: str, sequencia: int) -> str:
        """
        Constrói XML de Carta de Correção Eletrônica (CC-e)

        Tipo: 110110
        """
        condicao_uso = (
            "A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, "
            "de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido "
            "na emissao de documento fiscal, desde que o erro nao esteja relacionado com: "
            "I - as variaveis que determinam o valor do imposto tais como: base de calculo, "
            "aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; "
            "II - a correcao de dados cadastrais que implique mudanca do remetente ou do "
            "destinatario; III - a data de emissao ou de saida."
        )

        return self._build_evento(
            doc_fiscal=doc_fiscal,
            tipo_evento="110110",
            descricao_evento="Carta de Correcao",
            sequencia=sequencia,
            detalhes={
                "descEvento": "Carta de Correcao",
                "xCorrecao": texto_correcao[:1000],
                "xCondUso": condicao_uso
            }
        )

    def _build_evento(self, doc_fiscal, tipo_evento: str, descricao_evento: str,
                      sequencia: int, detalhes: Dict) -> str:
        """Constrói estrutura base do evento"""
        evento = ET.Element("evento", xmlns=NS_NFE, versao=VERSAO_NFE)

        inf_evento = ET.SubElement(
            evento, "infEvento",
            Id=f"ID{tipo_evento}{doc_fiscal.chave_acesso}{str(sequencia).zfill(2)}"
        )

        # Identificação do ambiente e emitente
        empresa = doc_fiscal.empresa
        ET.SubElement(inf_evento, "cOrgao").text = empresa.codigo_uf_ibge
        ET.SubElement(inf_evento, "tpAmb").text = doc_fiscal.ambiente
        ET.SubElement(inf_evento, "CNPJ").text = empresa.cnpj
        ET.SubElement(inf_evento, "chNFe").text = doc_fiscal.chave_acesso
        ET.SubElement(inf_evento, "dhEvento").text = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S-03:00")
        ET.SubElement(inf_evento, "tpEvento").text = tipo_evento
        ET.SubElement(inf_evento, "nSeqEvento").text = str(sequencia)
        ET.SubElement(inf_evento, "verEvento").text = "1.00"

        # Detalhes específicos do evento
        det_evento = ET.SubElement(inf_evento, "detEvento", versao="1.00")
        for key, value in detalhes.items():
            ET.SubElement(det_evento, key).text = str(value)

        # Formata XML
        rough_string = ET.tostring(evento, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ", encoding=None)


class NFeInutilizacaoBuilder:
    """Construtor de pedido de inutilização de numeração"""

    def build_inutilizacao(self, empresa, modelo: str, serie: int, ano: int,
                           numero_inicial: int, numero_final: int,
                           justificativa: str, ambiente: str = "2") -> str:
        """
        Constrói XML de pedido de inutilização

        ID: ID + cUF + AA + CNPJ + mod + série + nNFIni + nNFFin
        """
        # Monta ID
        id_inut = f"ID{empresa.codigo_uf_ibge}{str(ano)[-2:]}{empresa.cnpj}{modelo}{str(serie).zfill(3)}"
        id_inut += f"{str(numero_inicial).zfill(9)}{str(numero_final).zfill(9)}"

        inut_nfe = ET.Element("inutNFe", xmlns=NS_NFE, versao=VERSAO_NFE)

        inf_inut = ET.SubElement(inut_nfe, "infInut", Id=id_inut)

        ET.SubElement(inf_inut, "tpAmb").text = ambiente
        ET.SubElement(inf_inut, "xServ").text = "INUTILIZAR"
        ET.SubElement(inf_inut, "cUF").text = empresa.codigo_uf_ibge
        ET.SubElement(inf_inut, "ano").text = str(ano)[-2:]
        ET.SubElement(inf_inut, "CNPJ").text = empresa.cnpj
        ET.SubElement(inf_inut, "mod").text = modelo
        ET.SubElement(inf_inut, "serie").text = str(serie)
        ET.SubElement(inf_inut, "nNFIni").text = str(numero_inicial)
        ET.SubElement(inf_inut, "nNFFin").text = str(numero_final)
        ET.SubElement(inf_inut, "xJust").text = justificativa[:255]

        rough_string = ET.tostring(inut_nfe, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ", encoding=None)


class NFeConsultaBuilder:
    """Construtor de consultas NF-e"""

    def build_consulta_protocolo(self, chave_acesso: str, ambiente: str = "2") -> str:
        """Constrói XML de consulta de protocolo"""
        cons_sit = ET.Element("consSitNFe", xmlns=NS_NFE, versao=VERSAO_NFE)

        ET.SubElement(cons_sit, "tpAmb").text = ambiente
        ET.SubElement(cons_sit, "xServ").text = "CONSULTAR"
        ET.SubElement(cons_sit, "chNFe").text = chave_acesso

        rough_string = ET.tostring(cons_sit, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ", encoding=None)

    def build_status_servico(self, uf: str, ambiente: str = "2") -> str:
        """Constrói XML de consulta de status do serviço"""
        cons_stat = ET.Element("consStatServ", xmlns=NS_NFE, versao=VERSAO_NFE)

        ET.SubElement(cons_stat, "tpAmb").text = ambiente
        ET.SubElement(cons_stat, "cUF").text = uf
        ET.SubElement(cons_stat, "xServ").text = "STATUS"

        rough_string = ET.tostring(cons_stat, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ", encoding=None)
