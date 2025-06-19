import { describe, it, expect } from 'vitest';
import {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateCEP,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  removeMask
} from '../../../src/lib/validation'

describe('Validation Utils', () => {
  describe('CPF Validation', () => {
    it('deve validar CPF correto', () => {
      expect(validateCPF('11144477735')).toBe(true)
      expect(validateCPF('111.444.777-35')).toBe(true)
    })

    it('deve rejeitar CPF inválido', () => {
      expect(validateCPF('11144477734')).toBe(false) // Dígito verificador errado
      expect(validateCPF('111.444.777-34')).toBe(false)
    })

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
      expect(validateCPF('11111111111')).toBe(false)
      expect(validateCPF('000.000.000-00')).toBe(false)
      expect(validateCPF('999.999.999-99')).toBe(false)
    })

    it('deve rejeitar CPF com tamanho inválido', () => {
      expect(validateCPF('1234567890')).toBe(false) // 10 dígitos
      expect(validateCPF('123456789012')).toBe(false) // 12 dígitos
      expect(validateCPF('')).toBe(false)
    })

    it('deve rejeitar CPF com caracteres não numéricos', () => {
      expect(validateCPF('abc.def.ghi-jk')).toBe(false)
      expect(validateCPF('111.444.777-3a')).toBe(false)
    })
  })

  describe('CNPJ Validation', () => {
    it('deve validar CNPJ correto', () => {
      expect(validateCNPJ('11222333000181')).toBe(true)
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
    })

    it('deve rejeitar CNPJ inválido', () => {
      expect(validateCNPJ('11222333000180')).toBe(false) // Dígito verificador errado
      expect(validateCNPJ('11.222.333/0001-80')).toBe(false)
    })

    it('deve rejeitar CNPJ com todos os dígitos iguais', () => {
      expect(validateCNPJ('11111111111111')).toBe(false)
      expect(validateCNPJ('00.000.000/0000-00')).toBe(false)
    })

    it('deve rejeitar CNPJ com tamanho inválido', () => {
      expect(validateCNPJ('1122233300018')).toBe(false) // 13 dígitos
      expect(validateCNPJ('112223330001811')).toBe(false) // 15 dígitos
      expect(validateCNPJ('')).toBe(false)
    })
  })

  describe('Email Validation', () => {
    it('deve validar emails corretos', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('user123@test-domain.com')).toBe(true)
    })

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('invalidemail')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('user..name@domain.com')).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('deve validar telefones brasileiros corretos', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true)
      expect(validatePhone('11999999999')).toBe(true)
      expect(validatePhone('(11) 9999-9999')).toBe(true) // Número fixo
      expect(validatePhone('1199999999')).toBe(true)
    })

    it('deve rejeitar telefones inválidos', () => {
      expect(validatePhone('(11) 88999-9999')).toBe(false) // Celular deve começar com 9, não 8 
      expect(validatePhone('123')).toBe(false) // Muito curto
      expect(validatePhone('(11) 99999-99999')).toBe(false) // Muito longo
      expect(validatePhone('(00) 99999-9999')).toBe(false) // Área inválida (começa com 0)
      expect(validatePhone('')).toBe(false) // String vazia
    })
  })

  describe('CEP Validation', () => {
    it('deve validar CEP correto', () => {
      expect(validateCEP('01234-567')).toBe(true)
      expect(validateCEP('01234567')).toBe(true)
    })

    it('deve rejeitar CEP inválido', () => {
      expect(validateCEP('0123-456')).toBe(false) // Muito curto
      expect(validateCEP('012345678')).toBe(false) // Muito longo
      expect(validateCEP('abcde-fgh')).toBe(false) // Não numérico
      expect(validateCEP('')).toBe(false)
    })
  })

  describe('CPF Formatting', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35')
      expect(formatCPF('111.444.777-35')).toBe('111.444.777-35') // Já formatado
    })

    it('deve formatar CPF parcial', () => {
      expect(formatCPF('111')).toBe('111')
      expect(formatCPF('11144')).toBe('111.44')
      expect(formatCPF('11144477')).toBe('111.444.77')
      expect(formatCPF('1114447773')).toBe('111.444.777-3')
    })

    it('deve limitar tamanho do CPF', () => {
      expect(formatCPF('111444777351234')).toBe('111.444.777-35')
    })
  })

  describe('CNPJ Formatting', () => {
    it('deve formatar CNPJ corretamente', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81') // Já formatado
    })

    it('deve formatar CNPJ parcial', () => {
      expect(formatCNPJ('112')).toBe('11.2')
      expect(formatCNPJ('112223')).toBe('11.222.3')
      expect(formatCNPJ('11222333000')).toBe('11.222.333/000')
      expect(formatCNPJ('1122233300018')).toBe('11.222.333/0001-8')
    })

    it('deve limitar tamanho do CNPJ', () => {
      expect(formatCNPJ('112223330001811234')).toBe('11.222.333/0001-81')
    })
  })

  describe('Phone Formatting', () => {
    it('deve formatar telefone celular', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999') // Já formatado
    })

    it('deve formatar telefone fixo', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('deve formatar telefone parcial', () => {
      expect(formatPhone('11')).toBe('(11) ')
      expect(formatPhone('119')).toBe('(11) 9')
      expect(formatPhone('11999')).toBe('(11) 999')
      expect(formatPhone('1199999')).toBe('(11) 99999')
    })

    it('deve limitar tamanho do telefone', () => {
      expect(formatPhone('119999999991234')).toBe('(11) 99999-9999')
    })
  })

  describe('CEP Formatting', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatCEP('01234567')).toBe('01234-567')
      expect(formatCEP('01234-567')).toBe('01234-567') // Já formatado
    })

    it('deve formatar CEP parcial', () => {
      expect(formatCEP('012')).toBe('012')
      expect(formatCEP('01234')).toBe('01234')
      expect(formatCEP('012345')).toBe('01234-5')
    })

    it('deve limitar tamanho do CEP', () => {
      expect(formatCEP('012345671234')).toBe('01234-567')
    })
  })

  describe('Remove Mask', () => {
    it('deve remover máscaras de CPF', () => {
      expect(removeMask('111.444.777-35')).toBe('11144477735')
    })

    it('deve remover máscaras de CNPJ', () => {
      expect(removeMask('11.222.333/0001-81')).toBe('11222333000181')
    })

    it('deve remover máscaras de telefone', () => {
      expect(removeMask('(11) 99999-9999')).toBe('11999999999')
    })

    it('deve remover máscaras de CEP', () => {
      expect(removeMask('01234-567')).toBe('01234567')
    })

    it('deve manter string sem máscara', () => {
      expect(removeMask('abc123')).toBe('abc123')
      expect(removeMask('11144477735')).toBe('11144477735')
    })

    it('deve tratar strings vazias', () => {
      expect(removeMask('')).toBe('')
      expect(removeMask(null)).toBe('')
      expect(removeMask(undefined)).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('deve lidar com valores null/undefined', () => {
      expect(validateCPF(null)).toBe(false)
      expect(validateCPF(undefined)).toBe(false)
      expect(validateCNPJ(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })

    it('deve lidar com espaços em branco', () => {
      expect(validateCPF('  111.444.777-35  ')).toBe(true)
      expect(validateEmail('  user@example.com  ')).toBe(true)
    })

    it('deve manter formatação em strings vazias', () => {
      expect(formatCPF('')).toBe('')
      expect(formatCNPJ('')).toBe('')
      expect(formatPhone('')).toBe('')
      expect(formatCEP('')).toBe('')
    })
  })
}) 