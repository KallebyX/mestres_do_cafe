#!/usr/bin/env node

/**
 * Teste do MCP Docker Server
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

class MCPDockerTester {
  constructor() {
    this.server = null;
    this.requestId = 1;
  }

  async startServer() {
    console.log('🚀 Iniciando MCP Docker Server...');
    
    this.server = spawn('node', ['docker-server.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd()
    });

    // Aguardar o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Servidor iniciado');
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      this.server.stdout.once('data', (data) => {
        clearTimeout(timer);
        try {
          const response = JSON.parse(data.toString());
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

      this.server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testListTools() {
    console.log('\n📋 Testando lista de ferramentas...');
    
    try {
      const response = await this.sendRequest('tools/list');
      console.log('✅ Ferramentas disponíveis:');
      response.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      return true;
    } catch (error) {
      console.error('❌ Erro ao listar ferramentas:', error.message);
      return false;
    }
  }

  async testDockerPs() {
    console.log('\n🐳 Testando docker_ps...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'docker_ps',
        arguments: { all: false }
      });
      
      console.log('✅ Containers rodando:');
      console.log(response.result.content[0].text);
      return true;
    } catch (error) {
      console.error('❌ Erro ao executar docker_ps:', error.message);
      return false;
    }
  }

  async testDockerCompose() {
    console.log('\n📦 Testando docker_compose_ps...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'docker_compose_ps',
        arguments: { project_dir: '/Users/kalleby/Downloads/mestres_cafe_enterprise' }
      });
      
      console.log('✅ Status do docker-compose:');
      console.log(response.result.content[0].text);
      return true;
    } catch (error) {
      console.error('❌ Erro ao executar docker_compose_ps:', error.message);
      return false;
    }
  }

  async testHealthCheck() {
    console.log('\n🏥 Testando health check...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'docker_health_check',
        arguments: { 
          project_dir: '/Users/kalleby/Downloads/mestres_cafe_enterprise',
          detailed: true 
        }
      });
      
      console.log('✅ Status de saúde:');
      console.log(response.result.content[0].text);
      return true;
    } catch (error) {
      console.error('❌ Erro ao executar health check:', error.message);
      return false;
    }
  }

  async testTroubleshoot() {
    console.log('\n🔍 Testando troubleshoot...');
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'docker_troubleshoot',
        arguments: { include_logs: false }
      });
      
      console.log('✅ Diagnóstico:');
      console.log(response.result.content[0].text.substring(0, 500) + '...');
      return true;
    } catch (error) {
      console.error('❌ Erro ao executar troubleshoot:', error.message);
      return false;
    }
  }

  async runTests() {
    try {
      await this.startServer();
      
      const tests = [
        () => this.testListTools(),
        () => this.testDockerPs(),
        () => this.testDockerCompose(),
        () => this.testHealthCheck(),
        () => this.testTroubleshoot()
      ];

      let passed = 0;
      let failed = 0;

      for (const test of tests) {
        const result = await test();
        if (result) passed++;
        else failed++;
      }

      console.log('\n📊 Resultados dos testes:');
      console.log(`✅ Passou: ${passed}`);
      console.log(`❌ Falhou: ${failed}`);
      console.log(`📈 Taxa de sucesso: ${(passed / (passed + failed) * 100).toFixed(1)}%`);

      return failed === 0;
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
      return false;
    } finally {
      if (this.server) {
        this.server.kill();
        console.log('\n🛑 Servidor parado');
      }
    }
  }
}

// Executar testes se chamado diretamente
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const tester = new MCPDockerTester();
  
  tester.runTests().then(success => {
    console.log(success ? '\n🎉 Todos os testes passaram!' : '\n💥 Alguns testes falharam');
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Erro fatal:', error.message);
    process.exit(1);
  });
}