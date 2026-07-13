# Configuração SEO — Total Soluções Prediais

## 1. Escopo desta entrega

Esta configuração foi preparada para a landing page de **Higienização de Ar Condicionado Residencial, exclusivamente para modelos Split**, preservando integralmente:

- nome e posicionamento da Total Soluções Prediais;
- excelência em Engenharia desde 2014;
- preços, bairros, horário e CTAs definidos no briefing;
- conversão exclusivamente pelo WhatsApp;
- linguagem profissional, premium e sem promessas médicas;
- identidade visual em azul-marinho, dourado, branco e off-white.

A base utilizada foi o arquivo `index.html` mais recente do projeto, já contendo os SVGs inline. Nesta entrega, somente o `index.html` precisou ser atualizado. Os arquivos `critical.css`, `main.css`, `app.js`, `analytics.js` e `consent.js` permanecem inalterados e devem continuar sendo usados em suas versões mais recentes.

## 2. Estrutura entregue

```text
/
├── index.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── favicon.ico
├── SEO-README.md
├── assets/
│   ├── icons/
│   │   ├── favicon.svg
│   │   ├── apple-touch-icon.png
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon-maskable-512.png
│   └── img/
│       ├── logo-total-solucoes-prediais.svg
│       ├── logo-total-solucoes-prediais-512.png
│       └── og/
│           └── higienizacao-split-total-solucoes-1200x630.jpg
└── deploy/
    ├── headers-apache.conf
    └── headers-nginx.conf
```

Os arquivos existentes abaixo continuam necessários no projeto, mas não foram duplicados neste pacote:

```text
assets/css/critical.css
assets/css/main.css
assets/js/consent.js
assets/js/analytics.js
assets/js/app.js
assets/img/higienizacao-split-premium.webp
```

## 3. Meta tags

O `<head>` do `index.html` contém:

- `charset` e `viewport`;
- título orientado à intenção local e ao serviço;
- meta description com o serviço, bairros e autoridade da empresa;
- `author` e `application-name`;
- diretivas para Googlebot, Bingbot e demais rastreadores;
- `theme-color`, `color-scheme` e política de referrer;
- manifest, favicons e Apple Touch Icon;
- preload da imagem principal;
- Open Graph e Twitter/X Cards;
- Schema.org em JSON-LD.

Não foi adicionada a tag `keywords`, pois ela não é necessária para a configuração técnica moderna.

## 4. Canonical

A URL canônica configurada é:

```text
https://www.totalsolucoesprediais.com.br/higienizacao-split
```

A mesma URL é utilizada de forma consistente em:

- `link rel="canonical"`;
- `og:url`;
- entidades `WebPage` e `Service` no JSON-LD;
- BreadcrumbList;
- sitemap.

### Requisito de implantação

O servidor deve redirecionar, por HTTP 301, variações duplicadas para a URL canônica, incluindo quando aplicável:

- HTTP para HTTPS;
- domínio sem `www` para domínio com `www`;
- versões com parâmetros não essenciais;
- versões duplicadas com barra final ou arquivo `index.html`.

A regra exata de redirecionamento depende da hospedagem e não foi inserida automaticamente para evitar interferência em rotas existentes.

## 5. Open Graph

A configuração inclui:

- `og:locale` = `pt_BR`;
- tipo `website`;
- nome da empresa;
- título e descrição específicos para compartilhamento;
- URL canônica;
- imagem própria em JPEG, 1200 × 630 pixels;
- MIME type, dimensões, URL segura e texto alternativo.

Imagem entregue:

```text
assets/img/og/higienizacao-split-total-solucoes-1200x630.jpg
```

A arte segue a identidade visual institucional e não introduz preço, promessa médica ou serviço fora do escopo.

## 6. Twitter/X Cards

Foi configurado `summary_large_image`, reutilizando a imagem social 1200 × 630. Não foram inseridos `twitter:site` ou `twitter:creator`, pois nenhum perfil oficial foi fornecido no briefing.

## 7. Robots

### Meta robots

O HTML permite indexação e rastreamento, com visualização ampliada de imagens e sem limite artificial de snippet:

```text
index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
```

### robots.txt

O arquivo permite o rastreamento público da landing page e informa a localização do sitemap. Não foram criados bloqueios específicos para mecanismos de busca ou agentes de IA.

## 8. Sitemap XML

O sitemap contém a URL canônica da landing page e a data desta versão. Ao publicar uma nova revisão substancial, atualize o valor de `<lastmod>` para a data real da alteração.

Depois da publicação:

1. testar o acesso público ao arquivo `/sitemap.xml`;
2. cadastrar o domínio no Google Search Console e no Bing Webmaster Tools;
3. enviar o sitemap;
4. solicitar a inspeção da URL canônica.

Nenhuma meta tag de verificação do Search Console foi inventada. Ela deve ser adicionada somente após o proprietário fornecer o token real ou usar verificação por DNS.

## 9. Manifest

O `site.webmanifest` contém:

- nome e nome curto;
- descrição coerente com o serviço;
- idioma `pt-BR`;
- URL inicial e escopo;
- cores institucionais;
- ícones 192 × 192, 512 × 512 e maskable 512 × 512.

Foi usado `display: browser`, pois esta entrega é uma landing page, não uma aplicação instalada com experiência autônoma.

## 10. Favicons

Foram entregues:

- favicon tradicional em `.ico`, com múltiplos tamanhos;
- favicon vetorial em SVG;
- Apple Touch Icon 180 × 180;
- ícones PNG 192 × 192 e 512 × 512;
- ícone maskable 512 × 512.

Todos utilizam a paleta institucional, com contraste adequado em fundos claros e escuros.

## 11. Breadcrumb

O breadcrumb foi implementado em JSON-LD com a hierarquia:

```text
Início → Higienização de Ar Condicionado Split
```

Não foi inserido um breadcrumb visual adicional. Para esta landing page de rota única, a navegação interna existente já conduz o usuário às seções principais; adicionar outro componente visual exigiria alterações de layout e poderia criar ruído antes da conversão. Caso o site passe a ter páginas-filhas ou uma arquitetura de serviços mais ampla, um breadcrumb visual deve ser incluído e mantido sincronizado com o Schema.org.

## 12. Dados estruturados — Schema.org

O JSON-LD contém um único grafo conectado por `@id` com:

- `WebSite`;
- `HVACBusiness`;
- `Service`;
- `WebPage`;
- `BreadcrumbList`;
- `FAQPage`.

Foram incluídos somente dados verificados no briefing e na apresentação institucional:

- empresa e posicionamento;
- fundação em 2014;
- base operacional e endereço;
- WhatsApp/telefone;
- horário;
- bairros atendidos;
- serviço exclusivamente residencial Split;
- preços exatos;
- perguntas e respostas visíveis na página.

Não foram adicionados:

- `aggregateRating` ou `review` no Schema.org;
- latitude e longitude;
- CEP;
- perfil Google Business;
- redes sociais em `sameAs`;
- identificadores fiscais;
- e-mail como canal de conversão.

Esses campos dependem de dados oficiais adicionais. Os depoimentos continuam visíveis no HTML, mas não foram transformados em rich-result markup para evitar atribuição ou agregação não verificada.

## 13. SEO de imagens

### Imagem principal

O hero mantém:

- nome de arquivo descritivo;
- `width` e `height` explícitos para reservar espaço;
- `alt` objetivo e contextual;
- `figcaption` visível;
- `fetchpriority="high"`;
- `loading="eager"`;
- `decoding="async"`;
- preload no `<head>`.

Arquivo esperado no projeto:

```text
assets/img/higienizacao-split-premium.webp
```

### Imagem social

A imagem Open Graph possui:

- dimensões 1200 × 630;
- nome de arquivo semântico;
- texto alternativo em Open Graph e Twitter Cards;
- correspondência entre conteúdo visual, título e serviço da página.

### Logos e ícones

- o logo vetorial é adequado para uso técnico e documentação;
- o logo PNG 512 × 512 é referenciado no Schema.org;
- SVGs decorativos permanecem inline e marcados como ocultos para tecnologias assistivas quando não transmitem conteúdo.

## 14. Performance e Core Web Vitals

A configuração preserva e reforça:

- CSS crítico carregado antes do CSS principal;
- JavaScript com `defer`;
- imagem principal priorizada sem lazy loading;
- dimensões explícitas na imagem principal;
- SVGs inline, evitando requisições de ícones;
- fontes locais/de sistema;
- lazy loading progressivo do JavaScript existente para conteúdo não crítico;
- `content-visibility` existente nas seções abaixo da dobra;
- compressão e cache de arquivos estáticos por meio dos exemplos de servidor.

Metas técnicas de campo recomendadas no percentil 75:

- LCP: até 2,5 segundos;
- INP: até 200 milissegundos;
- CLS: até 0,1.

### Cabeçalhos de servidor

Foram incluídos modelos separados para Apache e Nginx. Use somente o arquivo correspondente à hospedagem. Antes de ativar:

- validar a sintaxe no ambiente de homologação;
- confirmar que os arquivos versionados ou seus nomes mudam quando o conteúdo é atualizado;
- não aplicar cache `immutable` a arquivos que serão sobrescritos mantendo o mesmo nome;
- confirmar compatibilidade com CDN e painel de hospedagem.

A configuração não foi aplicada nem testada no servidor de produção, pois esta entrega não possui acesso ao ambiente de hospedagem.

## 15. Configuração de analytics e plataformas

O `analytics.js` mais recente já está preparado para receber IDs reais de:

- Google Tag Manager;
- GA4;
- Meta Pixel;
- Microsoft Clarity.

Nenhum identificador foi inserido nesta entrega. O fluxo de consentimento existente deve ser preservado. Após receber os IDs oficiais, configure-os conforme a documentação já presente no arquivo `analytics.js`.

## 16. Sequência de implantação

1. Fazer backup da versão publicada.
2. Substituir o `index.html` pela versão desta entrega.
3. Publicar `robots.txt`, `sitemap.xml`, `site.webmanifest` e `favicon.ico` na raiz do domínio.
4. Publicar as novas pastas e imagens mantendo os caminhos exatos.
5. Manter os CSS e JavaScript mais recentes do projeto nas pastas já utilizadas.
6. Confirmar que o servidor entrega:
   - `.webmanifest` como `application/manifest+json`;
   - `.svg` como `image/svg+xml`;
   - `.xml` como `application/xml` ou `text/xml`.
7. Configurar redirecionamentos 301 para a URL canônica.
8. Aplicar, após teste, o modelo de headers correspondente ao servidor.
9. Testar a página em mobile e desktop.
10. Validar a indexação, os dados estruturados e o compartilhamento social após a publicação.

## 17. Checklist pós-publicação

- [ ] Canonical responde com HTTP 200.
- [ ] Variações duplicadas redirecionam por HTTP 301.
- [ ] `robots.txt` e `sitemap.xml` estão acessíveis.
- [ ] Manifest e todos os ícones retornam HTTP 200.
- [ ] Imagem Open Graph retorna HTTP 200 e 1200 × 630.
- [ ] Hero WebP retorna HTTP 200 e mantém 1280 × 853.
- [ ] Nenhum recurso CSS ou JavaScript retorna 404.
- [ ] JSON-LD passa no Schema Markup Validator.
- [ ] URL passa no teste de resultados avançados aplicável.
- [ ] Search Console reconhece a canonical declarada.
- [ ] Sitemap foi processado sem erros.
- [ ] Preview de compartilhamento foi atualizado nas plataformas.
- [ ] Lighthouse foi executado em mobile e desktop.
- [ ] Core Web Vitals de campo são acompanhados após coleta suficiente de dados.
- [ ] Cliques nos CTAs continuam abrindo o WhatsApp com as mensagens exatas.

## 18. Controle de alterações

### Arquivo alterado

- `index.html`: expansão e consolidação da configuração SEO, social, manifest, favicons, Schema.org, breadcrumb e prioridade da imagem LCP.

### Arquivos novos

- `robots.txt`;
- `sitemap.xml`;
- `site.webmanifest`;
- favicons e ícones;
- imagem Open Graph;
- logo técnico para Schema.org;
- modelos de headers Apache/Nginx;
- esta documentação.

### Arquivos preservados sem alteração

- `critical.css`;
- `main.css`;
- `app.js`;
- `analytics.js`;
- `consent.js`.
