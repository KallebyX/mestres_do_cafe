#!/usr/bin/env node

/**
 * Diagnóstico de problemas usando MCP Docker Server
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class DockerDiagnostic {
  async checkContainerStatus() {
    console.log('🔍 Verificando status dos containers...\n');
    
    try {
      const { stdout } = await execAsync('docker-compose ps --format table');
      console.log('📊 Status atual dos serviços:');
      console.log(stdout);
      
      // Verificar containers com problemas
      const { stdout: psOutput } = await execAsync('docker ps -a --format "{{.Names}} {{.Status}}"');
      const containers = psOutput.split('\n').filter(Boolean);
      
      console.log('\n🔍 Análise detalhada:');
      for (const container of containers) {
        const [name, ...statusParts] = container.split(' ');
        const status = statusParts.join(' ');
        
        if (status.includes('Exited') || status.includes('Dead')) {
          console.log(`❌ ${name}: ${status}`);
          await this.analyzeFailedContainer(name);
        } else if (status.includes('Up')) {
          console.log(`✅ ${name}: ${status}`);
        } else {
          console.log(`⚠️  ${name}: ${status}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar containers:', error.message);
    }
  }

  async analyzeFailedContainer(containerName) {
    try {
      console.log(`\n🔍 Analisando ${containerName}...`);
      
      // Obter logs do container
      const { stdout: logs } = await execAsync(`docker logs --tail 20 ${containerName}`);
      if (logs.trim()) {
        console.log('📋 Últimas 20 linhas dos logs:');
        console.log(logs);
      }
      
      // Obter informações detalhadas
      const { stdout: inspectOutput } = await execAsync(`docker inspect ${containerName}`);
      const inspectData = JSON.parse(inspectOutput)[0];
      
      console.log(`💀 Exit Code: ${inspectData.State.ExitCode}`);
      console.log(`⏰ Finished At: ${inspectData.State.FinishedAt}`);
      
      if (inspectData.State.Error) {
        console.log(`❌ Error: ${inspectData.State.Error}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao analisar ${containerName}:`, error.message);
    }
  }

  async checkNetworkConnectivity() {
    console.log('\n🌐 Verificando conectividade de rede...\n');
    
    try {
      // Listar redes
      const { stdout: networks } = await execAsync('docker network ls');
      console.log('📡 Redes Docker:');
      console.log(networks);
      
      // Verificar rede do projeto
      try {
        const { stdout: networkInfo } = await execAsync('docker network inspect mestres-network');
        const networkData = JSON.parse(networkInfo)[0];
        
        console.log('\n🔗 Containers na rede mestres-network:');
        Object.entries(networkData.Containers || {}).forEach(([containerId, info]) => {
          console.log(`  - ${info.Name}: ${info.IPv4Address}`);
        });
      } catch (error) {
        console.log('⚠️  Rede mestres-network não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar redes:', error.message);
    }
  }

  async checkVolumes() {
    console.log('\n💾 Verificando volumes...\n');
    
    try {
      const { stdout: volumes } = await execAsync('docker volume ls');
      console.log('📂 Volumes Docker:');
      console.log(volumes);
      
      // Verificar uso de espaço
      const { stdout: volumeUsage } = await execAsync('docker system df -v');
      console.log('\n💽 Uso de espaço:');
      console.log(volumeUsage);
    } catch (error) {
      console.error('❌ Erro ao verificar volumes:', error.message);
    }
  }

  async checkResourceUsage() {
    console.log('\n📊 Verificando uso de recursos...\n');
    
    try {
      const { stdout: stats } = await execAsync('docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\\t{{.NetIO}}\\t{{.BlockIO}}"');
      console.log('🖥️  Uso de recursos:');
      console.log(stats);
    } catch (error) {
      console.error('❌ Erro ao verificar recursos:', error.message);
    }
  }

  async checkSpecificServices() {
    console.log('\n🎯 Verificando serviços específicos...\n');
    
    const services = [
      { name: 'mestres_cafe_api', port: 5001, healthPath: '/api/health' },
      { name: 'mestres_cafe_db', port: 5432 },
      { name: 'mestres_cafe_redis', port: 6379 },
      { name: 'mestres_cafe_prometheus', port: 9090, healthPath: '/-/healthy' }
    ];

    for (const service of services) {
      await this.checkService(service);
    }
  }

  async checkService(service) {
    try {
      // Verificar se o container está rodando
      const { stdout: isRunning } = await execAsync(`docker ps --filter "name=${service.name}" --format "{{.Names}}"`);
      
      if (!isRunning.trim()) {
        console.log(`❌ ${service.name}: Container não está rodando`);
        return;
      }

      console.log(`✅ ${service.name}: Container rodando`);

      // Verificar porta se especificada
      if (service.port) {
        try {
          const { stdout: portCheck } = await execAsync(`docker port ${service.name} | grep ${service.port}`);
          console.log(`🔌 ${service.name}: Porta ${service.port} mapeada - ${portCheck.trim()}`);
        } catch {
          console.log(`⚠️  ${service.name}: Porta ${service.port} não mapeada`);
        }
      }

      // Verificar health check se disponível
      if (service.healthPath) {
        try {
          const { stdout: health } = await execAsync(`curl -s -f http://localhost:${service.port}${service.healthPath} || echo "FAILED"`);
          if (health.includes('FAILED')) {
            console.log(`❌ ${service.name}: Health check falhou`);
          } else {
            console.log(`✅ ${service.name}: Health check OK`);
          }
        } catch {
          console.log(`⚠️  ${service.name}: Não foi possível verificar health check`);
        }
      }

      // Verificar logs recentes para erros
      try {
        const { stdout: recentLogs } = await execAsync(`docker logs --tail 5 ${service.name} 2>&1`);
        const errorLines = recentLogs.split('\n').filter(line => 
          line.toLowerCase().includes('error') || 
          line.toLowerCase().includes('failed') ||
          line.toLowerCase().includes('exception')
        );
        
        if (errorLines.length > 0) {
          console.log(`⚠️  ${service.name}: Erros recentes encontrados:`);
          errorLines.forEach(line => console.log(`     ${line.trim()}`));
        }
      } catch {
        // Ignorar erros ao verificar logs
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Erro ao verificar ${service.name}:`, error.message);
    }
  }

  async generateReport() {
    console.log('📋 Gerando relatório de diagnóstico...\n');
    
    try {
      const { stdout: dockerVersion } = await execAsync('docker --version');
      const { stdout: composeVersion } = await execAsync('docker-compose --version');
      
      console.log('🔧 Versões:');
      console.log(`   Docker: ${dockerVersion.trim()}`);
      console.log(`   Docker Compose: ${composeVersion.trim()}`);
      console.log('');
      
      await this.checkContainerStatus();
      await this.checkSpecificServices();
      await this.checkNetworkConnectivity();
      await this.checkResourceUsage();
      await this.checkVolumes();
      
      console.log('\n🎯 Recomendações:');
      console.log('   1. Verifique logs detalhados dos containers com falha');
      console.log('   2. Confirme se todas as variáveis de ambiente estão definidas');
      console.log('   3. Verifique se há conflitos de porta');
      console.log('   4. Considere reiniciar containers com problemas');
      console.log('   5. Monitore uso de recursos para evitar limitações');
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error.message);
    }
  }

  async run() {
    console.log('🐳 Diagnóstico Docker - Mestres do Café Enterprise');
    console.log('===============================================\n');
    
    await this.generateReport();
    
    console.log('\n✅ Diagnóstico concluído!');
  }
}

// Executar diagnóstico
const diagnostic = new DockerDiagnostic();
diagnostic.run().catch(console.error);