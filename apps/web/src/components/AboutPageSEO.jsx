import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutPageSEO = () => {
  return (
    <Helmet>
      {/* Meta tags básicas */}
      <title>Mestres do Café | Torrefação de Cafés Especiais (SCAA) – Santa Maria/RS</title>
      <meta 
        name="description" 
        content="Torrefação de cafés especiais certificada SCAA em Santa Maria/RS. Grãos de MG, SP, BA e ES com pontuações 82+ a 87+. Serviços B2B: consultoria, white label, workshops e treinamentos. Desde 2019." 
      />
      <meta name="keywords" content="cafés especiais, torrefação, SCAA, Alta Mogiana, Serra do Caparaó, white label, consultoria de café, workshops de café, Santa Maria RS, torrefação artesanal" />
      
      {/* Open Graph */}
      <meta property="og:title" content="Mestres do Café | Torrefação de Cafés Especiais (SCAA) – Santa Maria/RS" />
      <meta property="og:description" content="Torrefação de cafés especiais certificada SCAA. Grãos de MG, SP, BA e ES com pontuações 82+ a 87+. Serviços B2B: consultoria, white label, workshops e treinamentos." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://mestresdocafe.com.br/sobre" />
      <meta property="og:image" content="https://mestresdocafe.com.br/images/og-about-1200x630.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Mestres do Café" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Mestres do Café | Torrefação de Cafés Especiais (SCAA)" />
      <meta name="twitter:description" content="Torrefação de cafés especiais certificada SCAA. Grãos de MG, SP, BA e ES com pontuações 82+ a 87+. Serviços B2B completos." />
      <meta name="twitter:image" content="https://mestresdocafe.com.br/images/twitter-about-1200x630.jpg" />
      
      {/* Schema.org - LocalBusiness */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Mestres do Café",
          "description": "Torrefação de cafés especiais certificada SCAA",
          "url": "https://mestresdocafe.com.br",
          "telephone": "+55996458600",
          "email": "financeiro.mestresdocafe@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Riachuelo 351, Sala 102",
            "addressLocality": "Santa Maria",
            "addressRegion": "RS",
            "postalCode": "97015-000",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-29.6868",
            "longitude": "-53.8149"
          },
          "openingHours": "Mo-Fr 08:00-18:00",
          "priceRange": "$$",
          "sameAs": [
            "https://instagram.com/mestresdocafe"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Cafés Especiais",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Catuai Amarelo 86+",
                  "description": "Café especial da Alta Mogiana/SP com pontuação 86+"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Arara 84+",
                  "description": "Café especial da Serra do Caparaó com pontuação 84+"
                }
              }
            ]
          }
        })}
      </script>
      
      {/* Schema.org - FAQPage */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "O que é SCAA?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "SCAA (Specialty Coffee Association of America) é a principal associação de cafés especiais do mundo, que estabelece padrões rigorosos de qualidade para classificar cafés com pontuação acima de 80 pontos."
              }
            },
            {
              "@type": "Question",
              "name": "Como funciona o white label?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "O white label permite que sua empresa tenha seu próprio café com sua marca. Desenvolvemos blends exclusivos e embalagem personalizada, mantendo a qualidade premium dos grãos selecionados."
              }
            },
            {
              "@type": "Question",
              "name": "Quais são as origens dos cafés?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Trabalhamos com grãos de Minas Gerais, São Paulo, Bahia e Espírito Santo, com foco especial nas regiões da Alta Mogiana/SP e Serra do Caparaó, reconhecidas mundialmente pela qualidade."
              }
            },
            {
              "@type": "Question",
              "name": "Como é o processo de torra?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cada lote recebe uma curva de torra sob medida. Ajustamos tempo, temperatura e desenvolvimento para realçar notas naturais e equilíbrio, garantindo consistência e qualidade excepcional."
              }
            },
            {
              "@type": "Question",
              "name": "Quais tamanhos de embalagem estão disponíveis?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Oferecemos embalagens de 100g, 250g, 500g e 1kg para atender diferentes necessidades, desde consumo doméstico até uso comercial."
              }
            },
            {
              "@type": "Question",
              "name": "Como solicitar uma proposta B2B?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Entre em contato via WhatsApp (55) 99645-8600 ou e-mail financeiro.mestresdocafe@gmail.com. Nossa equipe especializada preparará uma proposta personalizada para suas necessidades."
              }
            }
          ]
        })}
      </script>
      
      {/* Meta tags adicionais */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Mestres do Café" />
      <meta name="copyright" content="Mestres do Café" />
      <link rel="canonical" href="https://mestresdocafe.com.br/sobre" />
      
      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default AboutPageSEO;
