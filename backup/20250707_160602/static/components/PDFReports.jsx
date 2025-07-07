import React, { forwardRef } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Configurações globais do PDF
const PDF_CONFIG = {
  format: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  colors: {
    primary: '#b58150',
    secondary: '#8b5a3c',
    text: '#1f2937',
    lightGray: '#f3f4f6',
    darkGray: '#6b7280'
  },
  fonts: {
    title: 16,
    subtitle: 14,
    normal: 10,
    small: 8
  }
}

// Classe para geração de relatórios PDF
class PDFGenerator {
  constructor() {
    this.doc = new jsPDF(PDF_CONFIG.orientation, 'mm', PDF_CONFIG.format)
    this.currentY = PDF_CONFIG.margins.top
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.margins = PDF_CONFIG.margins
  }

  // Adicionar cabeçalho da empresa
  addHeader(title, subtitle = '') {
    // Logo/Nome da empresa
    this.doc.setFillColor(PDF_CONFIG.colors.primary)
    this.doc.rect(this.margins.left, this.currentY, this.pageWidth - this.margins.left - this.margins.right, 15, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(PDF_CONFIG.fonts.title)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('MESTRES DO CAFÉ - ERP', this.margins.left + 5, this.currentY + 10)
    
    // Data atual
    const currentDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    this.doc.setFontSize(PDF_CONFIG.fonts.small)
    this.doc.text(`Gerado em: ${currentDate}`, this.pageWidth - this.margins.right - 40, this.currentY + 10)
    
    this.currentY += 25

    // Título do relatório
    this.doc.setTextColor(PDF_CONFIG.colors.text)
    this.doc.setFontSize(PDF_CONFIG.fonts.title)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margins.left, this.currentY)
    this.currentY += 8

    // Subtítulo
    if (subtitle) {
      this.doc.setFontSize(PDF_CONFIG.fonts.subtitle)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(PDF_CONFIG.colors.darkGray)
      this.doc.text(subtitle, this.margins.left, this.currentY)
      this.currentY += 8
    }

    this.currentY += 5
  }

  // Adicionar linha horizontal
  addLine() {
    this.doc.setDrawColor(PDF_CONFIG.colors.darkGray)
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY)
    this.currentY += 5
  }

  // Adicionar seção
  addSection(title, data = []) {
    // Verificar se precisa de nova página
    if (this.currentY > this.pageHeight - 50) {
      this.addPage()
    }

    // Título da seção
    this.doc.setFontSize(PDF_CONFIG.fonts.subtitle)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(PDF_CONFIG.colors.primary)
    this.doc.text(title, this.margins.left, this.currentY)
    this.currentY += 10

    return this.currentY
  }

  // Adicionar tabela
  addTable(headers, data, options = {}) {
    const startY = this.currentY

    this.doc.autoTable({
      head: [headers],
      body: data,
      startY: startY,
      margin: { left: this.margins.left, right: this.margins.right },
      styles: {
        fontSize: PDF_CONFIG.fonts.normal,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: PDF_CONFIG.colors.lightGray
      },
      ...options
    })

    this.currentY = this.doc.lastAutoTable.finalY + 10
  }

  // Adicionar card de resumo
  addSummaryCards(cards) {
    const cardWidth = (this.pageWidth - this.margins.left - this.margins.right - 10) / 2
    const cardHeight = 25
    let x = this.margins.left
    let y = this.currentY

    cards.forEach((card, index) => {
      if (index > 0 && index % 2 === 0) {
        y += cardHeight + 5
        x = this.margins.left
      }

      // Fundo do card
      this.doc.setFillColor(PDF_CONFIG.colors.lightGray)
      this.doc.rect(x, y, cardWidth, cardHeight, 'F')

      // Borda
      this.doc.setDrawColor(PDF_CONFIG.colors.darkGray)
      this.doc.rect(x, y, cardWidth, cardHeight)

      // Título
      this.doc.setFontSize(PDF_CONFIG.fonts.small)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(PDF_CONFIG.colors.darkGray)
      this.doc.text(card.title, x + 3, y + 8)

      // Valor
      this.doc.setFontSize(PDF_CONFIG.fonts.subtitle)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(PDF_CONFIG.colors.primary)
      this.doc.text(card.value, x + 3, y + 18)

      x += cardWidth + 5
    })

    this.currentY = y + cardHeight + 15
  }

  // Adicionar gráfico (simulado com texto)
  addChart(title, data) {
    this.addSection(title)
    
    // Simular dados do gráfico como texto
    data.forEach(item => {
      this.doc.setFontSize(PDF_CONFIG.fonts.normal)
      this.doc.setTextColor(PDF_CONFIG.colors.text)
      this.doc.text(`${item.label}: ${item.value}`, this.margins.left + 5, this.currentY)
      this.currentY += 5
    })

    this.currentY += 5
  }

  // Adicionar nova página
  addPage() {
    this.doc.addPage()
    this.currentY = this.margins.top
  }

  // Adicionar rodapé
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      
      // Linha do rodapé
      this.doc.setDrawColor(PDF_CONFIG.colors.darkGray)
      this.doc.line(this.margins.left, this.pageHeight - 15, this.pageWidth - this.margins.right, this.pageHeight - 15)
      
      // Texto do rodapé
      this.doc.setFontSize(PDF_CONFIG.fonts.small)
      this.doc.setTextColor(PDF_CONFIG.colors.darkGray)
      this.doc.text('Mestres do Café - Sistema ERP', this.margins.left, this.pageHeight - 8)
      this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth - this.margins.right - 20, this.pageHeight - 8)
    }
  }

  // Finalizar e baixar PDF
  download(filename) {
    this.addFooter()
    this.doc.save(filename)
  }

  // Obter blob do PDF
  getBlob() {
    this.addFooter()
    return this.doc.output('blob')
  }
}

// Componente para gerar relatório financeiro
export const FinancialReport = ({ data, period }) => {
  const generateReport = () => {
    const pdf = new PDFGenerator()
    
    pdf.addHeader(
      'RELATÓRIO FINANCEIRO',
      `Período: ${period?.start || 'N/A'} a ${period?.end || 'N/A'}`
    )

    // Resumo financeiro
    const summaryData = [
      ['Total a Receber', `R$ ${(data?.totalReceivables || 0).toLocaleString('pt-BR')}`],
      ['Total a Pagar', `R$ ${(data?.totalPayables || 0).toLocaleString('pt-BR')}`],
      ['Saldo Total', `R$ ${(data?.totalBalance || 0).toLocaleString('pt-BR')}`],
      ['Resultado', `R$ ${(data?.netResult || 0).toLocaleString('pt-BR')}`]
    ]

    pdf.addTable(['Indicador', 'Valor'], summaryData)

    // Contas a Receber
    if (data?.accountsReceivable?.length > 0) {
      const receivablesHeaders = ['Cliente', 'Valor', 'Vencimento', 'Status']
      const receivablesData = data.accountsReceivable.map(item => [
        item.customer?.name || 'N/A',
        `R$ ${item.amount.toLocaleString('pt-BR')}`,
        format(new Date(item.due_date), 'dd/MM/yyyy'),
        item.status
      ])
      pdf.addTable(receivablesHeaders, receivablesData)
    }

    pdf.download(`relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  return (
    <button
      onClick={generateReport}
      className="flex items-center space-x-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-brown/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Gerar Relatório PDF</span>
    </button>
  )
}

// Componente para gerar relatório de estoque
export const StockReport = ({ data }) => {
  const generateReport = () => {
    const pdf = new PDFGenerator()
    
    pdf.addHeader('RELATÓRIO DE ESTOQUE')

    // Resumo de estoque
    const summaryData = [
      ['Total de Produtos', (data?.totalProducts || 0).toString()],
      ['Estoque Baixo', (data?.lowStockProducts || 0).toString()],
      ['Valor Total', `R$ ${(data?.totalStockValue || 0).toLocaleString('pt-BR')}`]
    ]

    pdf.addTable(['Indicador', 'Valor'], summaryData)

    // Produtos
    if (data?.products?.length > 0) {
      const productsHeaders = ['Produto', 'Estoque', 'Mínimo', 'Valor']
      const productsData = data.products.map(item => [
        item.name,
        (item.current_stock || 0).toString(),
        (item.min_stock || 0).toString(),
        `R$ ${(item.cost_price || 0).toLocaleString('pt-BR')}`
      ])
      pdf.addTable(productsHeaders, productsData)
    }

    pdf.download(`relatorio-estoque-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  return (
    <button
      onClick={generateReport}
      className="flex items-center space-x-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-brown/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Gerar Relatório PDF</span>
    </button>
  )
}

// Componente para gerar relatório de RH
export const HRReport = ({ data, period }) => {
  const generateReport = () => {
    const pdf = new PDFGenerator()
    
    pdf.addHeader('RELATÓRIO DE RECURSOS HUMANOS')

    // Resumo RH
    const summaryData = [
      ['Funcionários Ativos', (data?.activeEmployees || 0).toString()],
      ['Taxa de Presença', `${(data?.attendanceRate || 0).toFixed(1)}%`],
      ['Em Licença', (data?.onLeave || 0).toString()]
    ]

    pdf.addTable(['Indicador', 'Valor'], summaryData)

    // Funcionários
    if (data?.employees?.length > 0) {
      const employeesHeaders = ['Nome', 'Cargo', 'Departamento', 'Status']
      const employeesData = data.employees.map(item => [
        item.name,
        item.position || 'N/A',
        item.department || 'N/A',
        item.status
      ])
      pdf.addTable(employeesHeaders, employeesData)
    }

    pdf.download(`relatorio-rh-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  return (
    <button
      onClick={generateReport}
      className="flex items-center space-x-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-brown/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Gerar Relatório PDF</span>
    </button>
  )
}

// Componente para gerar relatório de vendas
export const SalesReport = ({ data, period }) => {
  const generateReport = () => {
    const pdf = new PDFGenerator()
    
    pdf.addHeader(
      'RELATÓRIO DE VENDAS',
      `Período: ${period?.start} a ${period?.end}`
    )

    // Cards de resumo
    const summaryCards = [
      { title: 'Total de Vendas', value: `R$ ${data.totalSales?.toLocaleString('pt-BR') || '0,00'}` },
      { title: 'Número de Pedidos', value: data.totalOrders?.toString() || '0' },
      { title: 'Ticket Médio', value: `R$ ${data.averageTicket?.toLocaleString('pt-BR') || '0,00'}` },
      { title: 'Conversão', value: `${data.conversionRate?.toFixed(1) || '0'}%` }
    ]
    pdf.addSummaryCards(summaryCards)

    // Vendas por produto
    if (data.productSales?.length > 0) {
      pdf.addSection('VENDAS POR PRODUTO')
      const salesHeaders = ['Produto', 'Quantidade', 'Valor Unitário', 'Total Vendido']
      const salesData = data.productSales.map(item => [
        item.name,
        item.quantity?.toString() || '0',
        `R$ ${item.unit_price?.toLocaleString('pt-BR') || '0,00'}`,
        `R$ ${(item.quantity * item.unit_price)?.toLocaleString('pt-BR') || '0,00'}`
      ])
      pdf.addTable(salesHeaders, salesData)
    }

    pdf.download(`relatorio-vendas-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  return (
    <button
      onClick={generateReport}
      className="flex items-center space-x-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-brown/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Gerar Relatório PDF</span>
    </button>
  )
}

// Componente genérico para relatórios personalizados
export const CustomReport = ({ title, data, columns, filename }) => {
  const generateReport = () => {
    const pdf = new PDFGenerator()
    
    pdf.addHeader(title)

    if (data?.length > 0) {
      const headers = columns.map(col => col.header)
      const tableData = data.map(item => 
        columns.map(col => {
          const value = col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
          return col.formatter ? col.formatter(value) : value?.toString() || 'N/A'
        })
      )
      pdf.addTable(headers, tableData)
    }

    pdf.download(filename || `relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  return (
    <button
      onClick={generateReport}
      className="flex items-center space-x-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-brown/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Gerar Relatório PDF</span>
    </button>
  )
}

export default {
  FinancialReport,
  StockReport,
  HRReport,
  SalesReport,
  CustomReport,
  PDFGenerator
} 