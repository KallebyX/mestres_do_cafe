# Arquitetura PDV Fiscal - Mestres do Café

## Sistema de Emissão de Documentos Fiscais Eletrônicos

**Versão:** 1.0.0
**Data:** Dezembro 2024
**Conformidade:** SEFAZ Nacional, MOC v7.0, Ajuste SINIEF 07/05

---

## 1. Visão Geral

Este documento descreve a arquitetura completa do sistema PDV Fiscal para emissão de documentos fiscais eletrônicos (NF-e, NFC-e) em conformidade total com a legislação brasileira.

### 1.1 Objetivos do Sistema

- Emissão legal de NF-e (modelo 55) e NFC-e (modelo 65)
- Geração de XML 100% compatível com schemas SEFAZ
- Assinatura digital via certificado ICP-Brasil
- Comunicação oficial com WebServices SEFAZ
- Armazenamento legal por 5+ anos
- Auditoria completa e compliance fiscal

### 1.2 Documentos Fiscais Suportados

| Modelo | Documento | Descrição |
|--------|-----------|-----------|
| 55 | NF-e | Nota Fiscal Eletrônica |
| 65 | NFC-e | Nota Fiscal de Consumidor Eletrônica |
| 59 | CF-e-SAT | Cupom Fiscal Eletrônico (São Paulo) |
| 99 | NFS-e | Nota Fiscal de Serviços Eletrônica |

---

## 2. Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE APRESENTAÇÃO                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  PDV Web   │  │  PDV Mobile │  │  Admin Web │  │  API REST/JSON     │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE NEGÓCIOS                             │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      FiscalService (Orquestrador)                   │ │
│  │  - Emissão NF-e/NFC-e    - Cancelamento    - Carta de Correção     │ │
│  │  - Inutilização          - Contingência    - Consultas             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────┐  │
│  │ NFeXMLBuilder  │  │ CertificateService │  │   SefazService        │  │
│  │ - Geração XML  │  │ - Gestão Certs A1 │  │ - Comunicação SEFAZ   │  │
│  │ - Validação    │  │ - Assinatura      │  │ - WebServices         │  │
│  └────────────────┘  └────────────────┘  └──────────────────────────┘  │
│                                    │                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────┐  │
│  │ TaxCalculator  │  │  DANFEGenerator │  │   NotificationService   │  │
│  │ - ICMS, PIS    │  │ - PDF DANFE     │  │ - Email Contador        │  │
│  │ - COFINS, IPI  │  │ - QR Code       │  │ - Webhook               │  │
│  └────────────────┘  └────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE DADOS                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL (Neon Serverless)                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │  Empresas   │  │ Documentos  │  │ Certificados│  │ Auditoria│  │  │
│  │  │  Emissoras  │  │   Fiscais   │  │  Digitais   │  │  Fiscal  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Armazenamento de Arquivos                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │  │
│  │  │  XMLs (S3)   │  │  DANFEs (S3) │  │  Certificados (Encrypted)│ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                        INTEGRAÇÕES EXTERNAS                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │   SEFAZ     │  │  Receita    │  │  Bancos     │  │   IBGE API   │   │
│  │ WebServices │  │   Federal   │  │  (CNAB)     │  │  Municípios  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelagem de Banco de Dados

### 3.1 Diagrama ER Principal

```
┌─────────────────────────┐       ┌─────────────────────────┐
│     EmpresaEmissora     │       │   ContadorResponsavel   │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ razao_social            │───────│ empresa_id (FK)         │
│ cnpj (UNIQUE)           │       │ nome_completo           │
│ inscricao_estadual      │       │ cpf/cnpj                │
│ inscricao_municipal     │       │ crc                     │
│ regime_tributario       │       │ crc_uf                  │
│ cnae_principal          │       │ email_principal         │
│ endereco_completo       │       └─────────────────────────┘
│ ambiente_atual          │
│ token_csc_nfce          │       ┌─────────────────────────┐
└───────────┬─────────────┘       │   CertificadoDigital    │
            │                      ├─────────────────────────┤
            │                      │ id (PK)                 │
            ├──────────────────────│ empresa_id (FK)         │
            │                      │ tipo (A1/A3/HSM)        │
            │                      │ serial_number           │
            │                      │ thumbprint              │
            │                      │ valido_de/valido_ate    │
            │                      │ certificado_pfx (CRYPT) │
            │                      │ status                  │
            │                      └─────────────────────────┘
            │
            │       ┌─────────────────────────┐
            └───────│      SerieFiscal        │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ empresa_id (FK)         │
                    │ modelo (55/65)          │
                    │ serie                   │
                    │ numero_atual            │
                    │ ambiente                │
                    └───────────┬─────────────┘
                                │
┌───────────────────────────────┴───────────────────────────────┐
│                      DocumentoFiscal                           │
├────────────────────────────────────────────────────────────────┤
│ id (PK)                                                        │
│ empresa_id (FK)                                                │
│ serie_fiscal_id (FK)                                           │
│ modelo, serie, numero                                          │
│ chave_acesso (44 dígitos, UNIQUE)                              │
│ tipo_operacao, finalidade, tipo_emissao                        │
│ ambiente, status                                               │
│ data_emissao                                                   │
│ dest_tipo_pessoa, dest_cpf/cnpj, dest_nome, dest_endereco      │
│ valor_produtos, valor_frete, valor_desconto                    │
│ valor_icms, valor_pis, valor_cofins, valor_ipi                 │
│ valor_total                                                    │
│ xml_original, xml_assinado, xml_protocolo                      │
│ protocolo_autorizacao, data_autorizacao                        │
│ protocolo_cancelamento (se cancelado)                          │
│ order_id (FK), sale_id (FK)                                    │
└───────────────────┬────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┬───────────────┐
    │               │               │               │
    ▼               ▼               ▼               ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ItemDocFisc │ │PagDocFiscal│ │EventoDocFis│ │CartaCorrec │
├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤
│documento_id│ │documento_id│ │documento_id│ │documento_id│
│numero_item │ │forma_pag   │ │tipo_evento │ │sequencia   │
│codigo_prod │ │valor       │ │sequencia   │ │texto       │
│descricao   │ │troco       │ │justificativa│ │protocolo  │
│ncm, cfop   │ │cartao_dados│ │protocolo   │ │status      │
│qtd, valor  │ └────────────┘ │xml_evento  │ └────────────┘
│icms, pis   │                └────────────┘
│cofins, ipi │
└────────────┘
```

### 3.2 Entidades Principais

#### EmpresaEmissora
Cadastro completo da empresa emissora conforme exigências SEFAZ:
- Identificação: CNPJ, IE, IM, CNAE
- Regime tributário (Simples, Lucro Presumido, Lucro Real)
- Endereço fiscal com código IBGE
- Tokens CSC para NFC-e
- Configurações de ambiente

#### ContadorResponsavel
Contador vinculado à empresa:
- Registro CRC/UF
- Configurações de envio automático
- Recebimento de XMLs e DANFEs

#### CertificadoDigital
Gestão de certificados ICP-Brasil:
- Suporte A1 (arquivo), A3 (token), HSM
- Dados criptografados (AES-256)
- Validação de cadeia e OCSP

#### DocumentoFiscal
Documento fiscal central:
- Chave de acesso 44 dígitos
- Status completo do ciclo de vida
- XMLs (original, assinado, protocolo)
- Vinculação com Order/Sale

---

## 4. Fluxo de Emissão NF-e/NFC-e

```
┌───────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE EMISSÃO DE NF-e/NFC-e                     │
└───────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │   1. Início     │
    │   (Pedido/Venda)│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ 2. Validação    │──NO──│  Retorna Erro   │
    │    de Dados     │      │  de Validação   │
    └────────┬────────┘      └─────────────────┘
             │ OK
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ 3. Verificar    │──NO──│  Erro:          │
    │   Certificado   │      │  Cert. Inválido │
    └────────┬────────┘      └─────────────────┘
             │ OK
             ▼
    ┌─────────────────┐
    │ 4. Obter Série  │
    │  e Próx. Número │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 5. Calcular     │
    │    Impostos     │
    │ ICMS,PIS,COFINS │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 6. Gerar Chave  │
    │   de Acesso     │
    │   (44 dígitos)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ 7. Gerar XML    │──ERR─│  Erro de        │
    │  (Padrão SEFAZ) │      │  Geração XML    │
    └────────┬────────┘      └─────────────────┘
             │ OK
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ 8. Validar XML  │──ERR─│  XML Inválido   │
    │   contra XSD    │      │  (Schema)       │
    └────────┬────────┘      └─────────────────┘
             │ OK
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ 9. Assinar XML  │──ERR─│  Erro de        │
    │   (XMLDSig)     │      │  Assinatura     │
    └────────┬────────┘      └─────────────────┘
             │ OK
             ▼
    ┌─────────────────┐
    │ 10. Montar Lote │
    │    (enviNFe)    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ 11. Enviar para │──ERR─│  Erro de        │
    │     SEFAZ       │      │  Comunicação    │
    └────────┬────────┘      │  → CONTINGÊNCIA │
             │               └─────────────────┘
             ▼
    ┌─────────────────────────────────────────┐
    │       12. Processar Resposta SEFAZ       │
    │  ┌─────────────┬─────────────┬────────┐ │
    │  │ cStat = 100 │ cStat = 1XX │ Outros │ │
    │  │ AUTORIZADO  │  REJEITADO  │  ERRO  │ │
    │  └──────┬──────┴──────┬──────┴───┬────┘ │
    └─────────┼─────────────┼──────────┼──────┘
              │             │          │
              ▼             ▼          ▼
    ┌─────────────────┐ ┌────────┐ ┌────────┐
    │ 13. Salvar      │ │Corrigir│ │ Tratar │
    │ - XML Protocolo │ │ Dados  │ │ Erro   │
    │ - Status = auth │ └────────┘ └────────┘
    │ - Log Auditoria │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 14. Gerar DANFE │
    │     (PDF)       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 15. Notificar   │
    │   - Contador    │
    │   - Cliente     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │    FIM          │
    │ NF-e Autorizada │
    └─────────────────┘
```

---

## 5. Estrutura do XML NF-e

### 5.1 Estrutura Hierárquica

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe{chave44}" versao="4.00">

        <!-- Identificação da NF-e -->
        <ide>
            <cUF>35</cUF>                    <!-- Código UF -->
            <cNF>12345678</cNF>              <!-- Código Numérico -->
            <natOp>VENDA</natOp>             <!-- Natureza Operação -->
            <mod>55</mod>                     <!-- Modelo -->
            <serie>1</serie>                  <!-- Série -->
            <nNF>123</nNF>                    <!-- Número -->
            <dhEmi>2024-12-20T10:00:00-03:00</dhEmi>
            <tpNF>1</tpNF>                    <!-- 1=Saída -->
            <idDest>1</idDest>                <!-- 1=Interna -->
            <cMunFG>3550308</cMunFG>          <!-- Município FG -->
            <tpImp>1</tpImp>                  <!-- Tipo Impressão -->
            <tpEmis>1</tpEmis>                <!-- Tipo Emissão -->
            <cDV>0</cDV>                      <!-- Dígito Verificador -->
            <tpAmb>2</tpAmb>                  <!-- Ambiente -->
            <finNFe>1</finNFe>                <!-- Finalidade -->
            <indFinal>1</indFinal>            <!-- Consumidor Final -->
            <indPres>1</indPres>              <!-- Presença -->
            <procEmi>0</procEmi>              <!-- Processo Emissão -->
            <verProc>1.0</verProc>            <!-- Versão App -->
        </ide>

        <!-- Emitente -->
        <emit>
            <CNPJ>12345678000190</CNPJ>
            <xNome>MESTRES DO CAFE LTDA</xNome>
            <xFant>MESTRES DO CAFE</xFant>
            <enderEmit>
                <xLgr>RUA DO CAFE</xLgr>
                <nro>100</nro>
                <xBairro>CENTRO</xBairro>
                <cMun>3550308</cMun>
                <xMun>SAO PAULO</xMun>
                <UF>SP</UF>
                <CEP>01000000</CEP>
                <cPais>1058</cPais>
                <xPais>BRASIL</xPais>
            </enderEmit>
            <IE>123456789012</IE>
            <CRT>3</CRT>                      <!-- Regime Tributário -->
        </emit>

        <!-- Destinatário -->
        <dest>
            <CPF>12345678901</CPF>
            <xNome>CONSUMIDOR FINAL</xNome>
            <enderDest>...</enderDest>
            <indIEDest>9</indIEDest>
            <email>cliente@email.com</email>
        </dest>

        <!-- Itens (1 a 990) -->
        <det nItem="1">
            <prod>
                <cProd>CAFE001</cProd>
                <cEAN>7891234567890</cEAN>
                <xProd>CAFE ESPECIAL 500G</xProd>
                <NCM>09012100</NCM>
                <CFOP>5102</CFOP>
                <uCom>UN</uCom>
                <qCom>2.0000</qCom>
                <vUnCom>49.90</vUnCom>
                <vProd>99.80</vProd>
                <cEANTrib>7891234567890</cEANTrib>
                <uTrib>UN</uTrib>
                <qTrib>2.0000</qTrib>
                <vUnTrib>49.90</vUnTrib>
                <indTot>1</indTot>
            </prod>
            <imposto>
                <vTotTrib>15.97</vTotTrib>
                <ICMS>
                    <ICMS00>
                        <orig>0</orig>
                        <CST>00</CST>
                        <modBC>3</modBC>
                        <vBC>99.80</vBC>
                        <pICMS>18.00</pICMS>
                        <vICMS>17.96</vICMS>
                    </ICMS00>
                </ICMS>
                <PIS>
                    <PISAliq>
                        <CST>01</CST>
                        <vBC>99.80</vBC>
                        <pPIS>1.65</pPIS>
                        <vPIS>1.65</vPIS>
                    </PISAliq>
                </PIS>
                <COFINS>
                    <COFINSAliq>
                        <CST>01</CST>
                        <vBC>99.80</vBC>
                        <pCOFINS>7.60</pCOFINS>
                        <vCOFINS>7.58</vCOFINS>
                    </COFINSAliq>
                </COFINS>
            </imposto>
        </det>

        <!-- Totais -->
        <total>
            <ICMSTot>
                <vBC>99.80</vBC>
                <vICMS>17.96</vICMS>
                <vICMSDeson>0.00</vICMSDeson>
                <vProd>99.80</vProd>
                <vFrete>0.00</vFrete>
                <vSeg>0.00</vSeg>
                <vDesc>0.00</vDesc>
                <vII>0.00</vII>
                <vIPI>0.00</vIPI>
                <vPIS>1.65</vPIS>
                <vCOFINS>7.58</vCOFINS>
                <vOutro>0.00</vOutro>
                <vNF>99.80</vNF>
                <vTotTrib>27.19</vTotTrib>
            </ICMSTot>
        </total>

        <!-- Transporte -->
        <transp>
            <modFrete>9</modFrete>            <!-- Sem frete -->
        </transp>

        <!-- Pagamento -->
        <pag>
            <detPag>
                <indPag>0</indPag>             <!-- À vista -->
                <tPag>01</tPag>                <!-- Dinheiro -->
                <vPag>99.80</vPag>
            </detPag>
        </pag>

        <!-- Informações Adicionais -->
        <infAdic>
            <infCpl>Venda realizada via e-commerce</infCpl>
        </infAdic>

        <!-- Responsável Técnico -->
        <infRespTec>
            <CNPJ>00000000000000</CNPJ>
            <xContato>Suporte Tecnico</xContato>
            <email>suporte@mestresdocafe.com.br</email>
            <fone>11999999999</fone>
        </infRespTec>

    </infNFe>

    <!-- Assinatura Digital (XMLDSig) -->
    <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>...</SignedInfo>
        <SignatureValue>...</SignatureValue>
        <KeyInfo>...</KeyInfo>
    </Signature>

</NFe>
```

---

## 6. Cálculo de Impostos

### 6.1 Tabela de Alíquotas ICMS Interestaduais

| Origem/Destino | SP | MG | RJ | RS | PR | SC | Outros |
|----------------|----|----|----|----|----|----|--------|
| **SP** | 18% | 12% | 12% | 12% | 12% | 12% | 12% |
| **MG** | 12% | 18% | 12% | 12% | 12% | 12% | 12% |
| **RJ** | 12% | 12% | 20% | 12% | 12% | 12% | 12% |
| **RS** | 12% | 12% | 12% | 17% | 12% | 12% | 12% |
| **Sul/Sudeste → Norte/Nordeste** | 7% | 7% | 7% | 7% | 7% | 7% | 7% |

### 6.2 Fórmula de Cálculo

```python
# ICMS
base_icms = valor_produto + frete + seguro + outras_despesas - desconto
valor_icms = base_icms * (aliquota_icms / 100)

# PIS (não cumulativo)
base_pis = valor_produto
valor_pis = base_pis * 0.0165  # 1.65%

# COFINS (não cumulativo)
base_cofins = valor_produto
valor_cofins = base_cofins * 0.0760  # 7.60%

# Valor Aproximado de Tributos (Lei 12.741)
valor_tributos = valor_icms + valor_pis + valor_cofins + valor_ipi
```

### 6.3 CST/CSOSN por Regime Tributário

**Regime Normal (CRT = 3):**
| CST | Descrição |
|-----|-----------|
| 00 | Tributada integralmente |
| 10 | Tributada com ST |
| 20 | Redução de base |
| 40 | Isenta |
| 41 | Não tributada |
| 60 | ICMS cobrado por ST |

**Simples Nacional (CRT = 1):**
| CSOSN | Descrição |
|-------|-----------|
| 101 | Tributada com permissão de crédito |
| 102 | Tributada sem permissão de crédito |
| 103 | Isenção do ICMS no SN |
| 500 | ICMS cobrado por ST |
| 900 | Outros |

---

## 7. Segurança e Compliance

### 7.1 Requisitos de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADAS DE SEGURANÇA                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. AUTENTICAÇÃO                                             │
│     ├─ JWT com expiração                                     │
│     ├─ Refresh tokens seguros                                │
│     └─ MFA para operações fiscais                            │
│                                                              │
│  2. AUTORIZAÇÃO                                              │
│     ├─ RBAC (Role-Based Access Control)                      │
│     ├─ Perfis: Admin, Contador, Operador PDV                 │
│     └─ Permissões granulares por operação                    │
│                                                              │
│  3. CRIPTOGRAFIA                                             │
│     ├─ TLS 1.3 em todas comunicações                         │
│     ├─ Certificados armazenados com AES-256                  │
│     ├─ Senhas com bcrypt (cost 12)                           │
│     └─ Dados sensíveis criptografados em repouso             │
│                                                              │
│  4. AUDITORIA                                                │
│     ├─ Logs imutáveis de todas operações fiscais             │
│     ├─ Hash de integridade (SHA-256)                         │
│     ├─ Timestamp com timezone                                │
│     └─ IP e User-Agent registrados                           │
│                                                              │
│  5. LGPD                                                     │
│     ├─ Consentimento para dados pessoais                     │
│     ├─ Anonimização quando aplicável                         │
│     ├─ Direito ao esquecimento (dados não fiscais)           │
│     └─ Relatório de tratamento de dados                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Auditoria Fiscal

Todas as operações fiscais são registradas na tabela `auditorias_fiscais`:

| Campo | Descrição |
|-------|-----------|
| entidade | documento_fiscal, empresa, certificado |
| operacao | create, update, authorize, cancel |
| dados_anteriores | Estado antes da alteração (JSON) |
| dados_novos | Estado após alteração (JSON) |
| usuario_id | Quem executou |
| ip_origem | IP do requisitante |
| hash_registro | SHA-256 para integridade |

---

## 8. Contingência Fiscal

### 8.1 Tipos de Contingência

| Tipo | Código | Descrição |
|------|--------|-----------|
| FS-IA | 2 | Formulário de Segurança - Impressor Autônomo |
| EPEC | 4 | Evento Prévio de Emissão em Contingência |
| FS-DA | 5 | Formulário de Segurança - DANFE |
| SVC-AN | 6 | SEFAZ Virtual de Contingência - AN |
| SVC-RS | 7 | SEFAZ Virtual de Contingência - RS |
| Offline | 9 | Contingência off-line NFC-e |

### 8.2 Fluxo de Contingência

```
                    ┌─────────────────────┐
                    │  Tentativa Normal   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  SEFAZ Disponível?  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │ SIM            │                │ NÃO
              ▼                │                ▼
    ┌─────────────────┐        │      ┌─────────────────┐
    │  Emissão Normal │        │      │ Verificar Tipo  │
    │    (tpEmis=1)   │        │      │  de Contingência│
    └─────────────────┘        │      └────────┬────────┘
                               │               │
                               │    ┌──────────┴──────────┐
                               │    │                     │
                               ▼    ▼                     ▼
                    ┌───────────────────┐    ┌───────────────────┐
                    │    SVC-AN/RS      │    │   Offline NFC-e   │
                    │    (tpEmis=6/7)   │    │    (tpEmis=9)     │
                    └─────────┬─────────┘    └─────────┬─────────┘
                              │                        │
                              │                        ▼
                              │              ┌─────────────────┐
                              │              │ Transmitir após │
                              │              │   normalização  │
                              │              └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  NF-e Autorizada│
                    │ em Contingência │
                    └─────────────────┘
```

---

## 9. Checklist de Conformidade Legal

### 9.1 Checklist SEFAZ

- [x] XML conforme schema XSD oficial
- [x] Chave de acesso 44 dígitos válida
- [x] Assinatura digital XMLDSig
- [x] Certificado ICP-Brasil válido
- [x] CFOP correto para operação
- [x] NCM válido (8 dígitos)
- [x] CST/CSOSN conforme regime
- [x] Cálculo de impostos correto
- [x] Numeração sequencial sem gaps
- [x] Série configurada corretamente
- [x] Ambiente (produção/homologação)
- [x] Código município IBGE válido

### 9.2 Checklist Armazenamento

- [x] XMLs armazenados por 5+ anos
- [x] DANFEs disponíveis para reimpressão
- [x] Backup automático diário
- [x] Recuperação de desastres
- [x] Criptografia em repouso
- [x] Controle de acesso aos arquivos

### 9.3 Checklist Auditoria

- [x] Log de todas operações fiscais
- [x] Trilha de auditoria imutável
- [x] Hash de integridade
- [x] Identificação de usuário
- [x] Timestamp com timezone
- [x] IP de origem registrado

---

## 10. Pontos Críticos e Riscos

### 10.1 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Certificado expirado | Média | Alto | Alerta 30 dias antes |
| SEFAZ indisponível | Baixa | Alto | Contingência automática |
| Falha de conexão | Média | Médio | Retry com backoff |
| Gap de numeração | Baixa | Alto | Inutilização automática |
| XML rejeitado | Média | Médio | Validação prévia XSD |
| Dados inconsistentes | Baixa | Alto | Validação de entrada |

### 10.2 Monitoramento

```python
# Métricas monitoradas
metrics = {
    "certificado_dias_expiracao": 30,  # Alerta
    "taxa_rejeicao_sefaz": 0.01,       # Max 1%
    "tempo_resposta_sefaz_ms": 3000,   # Max 3s
    "documentos_pendentes": 0,          # Zero em contingência
    "erros_assinatura": 0,             # Zero tolerância
}
```

---

## 11. Boas Práticas SEFAZ

### 11.1 Recomendações Oficiais

1. **Validação Prévia**: Sempre validar XML contra XSD antes de enviar
2. **Lote Síncrono**: Usar indSinc=1 para até 1 NF-e (resposta imediata)
3. **Consulta Recibo**: Se assíncrono, consultar recibo após 15 segundos
4. **Contingência**: Implementar todos os tipos de contingência
5. **Certificado**: Verificar validade e OCSP periodicamente
6. **Numeração**: Nunca reutilizar número, inutilizar gaps
7. **Cancelamento**: Respeitar prazo de 24h (NF-e) ou 30min (NFC-e)
8. **CC-e**: Máximo 20 correções, não alterar valores

### 11.2 Performance

- Cache de configurações SEFAZ
- Pool de conexões HTTP
- Timeout adequado (30s)
- Retry com exponential backoff
- Processamento assíncrono de lotes grandes

---

## 12. APIs Disponíveis

### 12.1 Endpoints Fiscais

```
POST   /api/fiscal/nfe/emitir           # Emitir NF-e
POST   /api/fiscal/nfce/emitir          # Emitir NFC-e
POST   /api/fiscal/documento/cancelar    # Cancelar documento
POST   /api/fiscal/documento/corrigir    # Carta de Correção
POST   /api/fiscal/numeracao/inutilizar  # Inutilizar faixa
GET    /api/fiscal/documento/{id}        # Consultar documento
GET    /api/fiscal/documento/{id}/xml    # Download XML
GET    /api/fiscal/documento/{id}/danfe  # Download DANFE
GET    /api/fiscal/sefaz/status          # Status do serviço
```

### 12.2 Endpoints de Configuração

```
GET/POST  /api/fiscal/empresa             # Empresa emissora
GET/POST  /api/fiscal/contador            # Contador
GET/POST  /api/fiscal/certificado         # Certificado digital
GET/POST  /api/fiscal/serie               # Séries fiscais
GET       /api/fiscal/ncm                 # Códigos NCM
GET       /api/fiscal/cfop                # Códigos CFOP
```

---

## 13. Referências Legais

- **Ajuste SINIEF 07/05**: Instituição da NF-e
- **Ajuste SINIEF 01/07**: Carta de Correção Eletrônica
- **Nota Técnica 2019.001**: Leiaute NF-e 4.00
- **Manual de Orientação do Contribuinte (MOC) v7.0**
- **Lei 12.741/2012**: Valor aproximado de tributos
- **LC 123/2006**: Simples Nacional
- **Resolução CGSN 140/2018**: Regulamento do Simples
- **LGPD (Lei 13.709/2018)**: Proteção de dados

---

## 14. Contato e Suporte

**Desenvolvedor:** Mestres do Café Tech
**Email:** fiscal@mestresdocafe.com.br
**Documentação SEFAZ:** https://www.nfe.fazenda.gov.br

---

*Este documento é atualizado continuamente conforme alterações na legislação fiscal brasileira.*
