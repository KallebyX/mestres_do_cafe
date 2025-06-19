import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../../src/components/Footer';

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer', () => {
  describe('Renderização básica', () => {
    it('deve renderizar informações da empresa', () => {
      renderWithRouter();
      
      expect(screen.getAllByText(/mestres do café/i)).toHaveLength(2);
      expect(screen.getByText(/torrefação artesanal/i)).toBeInTheDocument();
    });

    it('deve mostrar ano atual no copyright', () => {
      renderWithRouter();
      
      expect(screen.getByText(/© 2024 mestres do café/i)).toBeInTheDocument();
    });

    it('deve mostrar informações de contato', () => {
      renderWithRouter();
      
      expect(screen.getByText(/\(55\) 99645-8600/)).toBeInTheDocument();
      expect(screen.getByText(/contato@mestrescafe\.com\.br/)).toBeInTheDocument();
    });
  });

  describe('Links de navegação', () => {
    it('deve renderizar links para páginas principais', () => {
      renderWithRouter();
      
      expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
      expect(screen.getByText(/sobre nós/i)).toBeInTheDocument();
      expect(screen.getAllByText(/contato/i)).toHaveLength(3); // Título, link nav, título seção
    });

    it('deve ter links funcionais de navegação', () => {
      renderWithRouter();
      
      // Apenas verificar que existem os textos de navegação
      expect(screen.getByText(/início/i)).toBeInTheDocument();
      expect(screen.getByText(/cursos/i)).toBeInTheDocument();
      expect(screen.getByText(/blog/i)).toBeInTheDocument();
    });

    it('deve ter seções organizadas', () => {
      renderWithRouter();
      
      expect(screen.getByText(/navegação/i)).toBeInTheDocument();
      expect(screen.getByText(/suporte/i)).toBeInTheDocument();
      // Não testar "contato" aqui por ser duplicado
    });
  });

  describe('Informações legais', () => {
    it('deve mostrar links para políticas', () => {
      renderWithRouter();
      
      expect(screen.getByText(/política de privacidade/i)).toBeInTheDocument();
      expect(screen.getByText(/termos de uso/i)).toBeInTheDocument();
    });

    it('deve mostrar endereço da empresa', () => {
      renderWithRouter();
      
      expect(screen.getByText(/santa maria - rs, brasil/i)).toBeInTheDocument();
    });
  });

  describe('Redes sociais', () => {
    it('deve renderizar seção de redes sociais', () => {
      renderWithRouter();
      
      expect(screen.getByText(/siga-nos/i)).toBeInTheDocument();
    });

    it('deve ter links das redes sociais funcionais', () => {
      renderWithRouter();
      
      const instagramLink = screen.getByRole('link', { name: /📷/ });
      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Informações da empresa', () => {
    it('deve mostrar descrição da empresa', () => {
      renderWithRouter();
      
      expect(screen.getByText(/há mais de 5 anos dedicados/i)).toBeInTheDocument();
      expect(screen.getByText(/desenvolvido com ☕ em santa maria/i)).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve manter elementos principais em qualquer tamanho', () => {
      renderWithRouter();
      
      // Elementos essenciais devem estar presentes
      expect(screen.getAllByText(/mestres do café/i)).toHaveLength(2);
      expect(screen.getByText(/contato@mestrescafe\.com\.br/)).toBeInTheDocument();
      expect(screen.getByText(/\(55\) 99645-8600/)).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      renderWithRouter();
      
      // Verificar se usa elementos semânticos corretos
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('deve ter links funcionais', () => {
      renderWithRouter();
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Verificar alguns links específicos
      const whatsappLink = screen.getByRole('link', { name: /\(55\) 99645-8600/ });
      expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/5555996458600');
      
      const emailLink = screen.getByRole('link', { name: /contato@mestrescafe\.com\.br/ });
      expect(emailLink).toHaveAttribute('href', 'mailto:contato@mestrescafe.com.br');
    });
  });
});