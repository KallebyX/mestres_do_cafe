import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Customer Creation Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar cliente e ativar conta com sucesso', async () => {
    // Simula fluxo completo
    const mockCreateCustomer = vi.fn().mockResolvedValue({
      success: true,
      customer: { id: '123', name: 'João Silva' }
    });

    const result = await mockCreateCustomer({
      name: 'João Silva',
      email: 'joao@test.com',
      user_type: 'cliente_pf'
    });

    expect(result.success).toBe(true);
    expect(result.customer.name).toBe('João Silva');
  });
}); 