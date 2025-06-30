import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';

// Carregar variáveis de ambiente
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY
} = process.env;

// Validar variáveis obrigatórias
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  console.error('Verifique se o arquivo .env está configurado corretamente');
  process.exit(1);
}

console.log('🔌 Conectando ao Supabase...');
console.log(`📡 URL: ${SUPABASE_URL}`);

// Cliente Supabase usando Service Role Key para operações administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Lista todas as tabelas do schema public (exceto views)
 */
async function listTables() {
  console.log('📋 Listando tabelas do schema public...');
  
  try {
    // Consultar information_schema para listar tabelas
    const { data, error } = await supabase.rpc('get_public_tables', {});
    
    if (error) {
      // Fallback: tentar consulta direta se a função RPC não existir
      console.log('⚠️ Função RPC não encontrada, usando consulta direta...');
      
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_type', 'VIEW');
        
      if (tablesError) {
        throw new Error(`Erro ao listar tabelas: ${tablesError.message}`);
      }
      
      return tablesData?.map(r => r.table_name) || [];
    }
    
    return data?.map(r => r.table_name) || [];
  } catch (err) {
    // Fallback manual para tabelas conhecidas
    console.log('⚠️ Usando lista de tabelas conhecidas como fallback...');
    return [
      'users',
      'products', 
      'orders',
      'order_items',
      'blog_posts',
      'cart_items',
      'points_history',
      'user_stats'
    ];
  }
}

/**
 * Exporta todos os registros de uma tabela
 */
async function exportTable(tableName) {
  try {
    console.log(`📦 Exportando tabela: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`❌ Erro ao exportar ${tableName}:`, error.message);
      return null;
    }
    
    const recordCount = data?.length || 0;
    console.log(`✅ ${tableName}: ${recordCount} registros exportados`);
    
    return data || [];
  } catch (err) {
    console.error(`❌ Erro inesperado ao exportar ${tableName}:`, err.message);
    return null;
  }
}

/**
 * Função principal de exportação
 */
async function exportAllTables() {
  try {
    console.log('🚀 Iniciando export completo do Supabase...');
    console.log('=' .repeat(50));
    
    // Listar todas as tabelas
    const tables = await listTables();
    
    if (!tables || tables.length === 0) {
      console.log('⚠️ Nenhuma tabela encontrada para exportar');
      return;
    }
    
    console.log(`📊 Tabelas encontradas: ${tables.length}`);
    console.log(`📋 Lista: ${tables.join(', ')}`);
    console.log('=' .repeat(50));
    
    // Exportar cada tabela
    const exportData = {};
    let totalRecords = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const tableName of tables) {
      const tableData = await exportTable(tableName);
      
      if (tableData !== null) {
        exportData[tableName] = tableData;
        totalRecords += tableData.length;
        successCount++;
      } else {
        exportData[tableName] = [];
        errorCount++;
      }
    }
    
    // Adicionar metadados do export
    const exportMetadata = {
      export_timestamp: new Date().toISOString(),
      export_date: new Date().toLocaleDateString('pt-BR'),
      export_time: new Date().toLocaleTimeString('pt-BR'),
      supabase_url: SUPABASE_URL,
      total_tables: tables.length,
      successful_exports: successCount,
      failed_exports: errorCount,
      total_records: totalRecords,
      tables_exported: tables
    };
    
    // Criar objeto final com metadados
    const finalExportData = {
      _metadata: exportMetadata,
      ...exportData
    };
    
    // Salvar arquivo JSON
    const fileName = 'supabase-full-export.json';
    await fs.writeFile(
      fileName,
      JSON.stringify(finalExportData, null, 2),
      'utf8'
    );
    
    // Relatório final
    console.log('=' .repeat(50));
    console.log('🎉 EXPORT CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(50));
    console.log(`📁 Arquivo: ${fileName}`);
    console.log(`📊 Tabelas exportadas: ${successCount}/${tables.length}`);
    console.log(`📈 Total de registros: ${totalRecords.toLocaleString('pt-BR')}`);
    console.log(`⏰ Data/Hora: ${exportMetadata.export_date} às ${exportMetadata.export_time}`);
    
    if (errorCount > 0) {
      console.log(`⚠️ Tabelas com erro: ${errorCount}`);
    }
    
    console.log('=' .repeat(50));
    console.log('Export concluído em supabase-full-export.json');
    
  } catch (error) {
    console.error('❌ Erro no processo de export:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Executar export se chamado diretamente
// Em ES modules, verificamos se é o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  exportAllTables();
}

export {
  exportAllTables,
  listTables,
  exportTable
}; 