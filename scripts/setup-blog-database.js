import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rlabdmfigohvgpvhjdqv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBlogDatabase() {
  console.log('🚀 Configurando banco de dados do blog...');

  try {
    // Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const tables = ['blog_posts', 'blog_likes', 'blog_comments', 'blog_shares', 'blog_categories'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST106') {
          console.log(`⚠️  Tabela ${table} não existe - você pode precisar executar o setup-completo.sql`);
        } else {
          console.log(`✅ Tabela ${table} existe`);
        }
      } else {
        console.log(`✅ Tabela ${table} existe e acessível`);
      }
    }

    // Verificar posts existentes
    const { data: blogPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title, status, slug, likes_count, comments_count, views_count')
      .limit(10);

    if (postsError) {
      console.log('❌ Erro ao buscar posts:', postsError.message);
    } else {
      console.log(`📝 Posts encontrados: ${blogPosts.length}`);
      blogPosts.forEach(post => {
        console.log(`   - ${post.title} (${post.status}) - slug: ${post.slug}`);
        console.log(`     Views: ${post.views_count || 0}, Likes: ${post.likes_count || 0}, Comments: ${post.comments_count || 0}`);
      });
    }

    // Testar função de incremento de visualizações se há posts
    if (blogPosts && blogPosts.length > 0) {
      console.log('🧪 Testando função de incremento de visualizações...');
      
      const { error: viewError } = await supabase.rpc('increment_post_views', {
        post_id: blogPosts[0].id
      });

      if (viewError) {
        console.log('⚠️  Erro ao testar função de visualizações:', viewError.message);
        console.log('🔧 Você pode precisar executar as funções SQL manualmente no Supabase');
      } else {
        console.log('✅ Função de incremento de visualizações funcionando');
      }
    }

    // Verificar se há dados de exemplo do blog
    if (blogPosts.length === 0) {
      console.log('📝 Criando post de exemplo para teste...');
      
      const examplePost = {
        title: 'Bem-vindos ao Blog dos Mestres do Café',
        slug: 'bem-vindos-blog-mestres-cafe',
        excerpt: 'Este é nosso primeiro post! Aqui compartilharemos dicas, novidades e curiosidades sobre o mundo do café.',
        content: `# Bem-vindos ao Blog dos Mestres do Café!

Estamos muito felizes em dar as boas-vindas a todos vocês ao nosso blog! 

Este é um espaço dedicado ao compartilhamento de conhecimento sobre:

## 🌟 O que você vai encontrar aqui:

- **Dicas de preparo**: Aprenda técnicas para extrair o melhor do seu café
- **Origem e variedades**: Conheça diferentes regiões produtoras e tipos de grãos
- **Métodos de extração**: V60, Chemex, Prensa Francesa e muito mais
- **Torrefação**: Os segredos por trás da torra perfeita
- **Receitas especiais**: Drinks criativos e combinações deliciosas

## ☕ Nossa missão

Compartilhar a paixão pelo café de qualidade e ajudar você a descobrir novos sabores e aromas incríveis.

**Aproveite a leitura e não esqueça de curtir e comentar!**`,
        category: 'Geral',
        tags: ['bem-vindos', 'blog', 'café'],
        author_name: 'Mestres do Café',
        status: 'published',
        is_featured: true,
        seo_title: 'Bem-vindos ao Blog dos Mestres do Café',
        seo_description: 'Descubra dicas, novidades e curiosidades sobre o mundo do café no blog oficial dos Mestres do Café.',
        published_at: new Date().toISOString()
      };

      const { data: newPost, error: createError } = await supabase
        .from('blog_posts')
        .insert([examplePost])
        .select()
        .single();

      if (createError) {
        console.log('⚠️  Erro ao criar post de exemplo:', createError.message);
      } else {
        console.log('✅ Post de exemplo criado com sucesso!');
        console.log(`   - Título: ${newPost.title}`);
        console.log(`   - Slug: ${newPost.slug}`);
      }
    }

    console.log('\n🎉 Configuração do blog concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse http://localhost:5173/blog para ver a lista de artigos');
    console.log('2. Clique em um artigo para ver os detalhes');
    console.log('3. Faça login para curtir e comentar');
    console.log('4. Use http://localhost:5173/admin/blog para gerenciar posts (admin)');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupBlogDatabase();
}

export { setupBlogDatabase }; 