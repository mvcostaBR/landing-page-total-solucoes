# Otimização GEO — Total Soluções Prediais

## 1. Escopo

Esta entrega otimiza a landing page canônica:

`https://www.totalsolucoesprediais.com.br/higienizacao-split`

O conteúdo permanece limitado à **Higienização de Ar Condicionado Residencial, exclusivamente para modelos Split**, com conversão exclusivamente pelo WhatsApp.

A otimização foi construída sobre os requisitos oficiais do projeto e preserva integralmente:

- preços;
- bairros;
- horário;
- textos e mensagens dos CTAs;
- restrições do serviço;
- ausência de formulários;
- linguagem profissional, premium e sem promessas médicas;
- identidade visual existente em azul-marinho, dourado, branco e off-white.

## 2. Arquivos desta entrega

- `index.html`: conteúdo e estrutura semântica atualizados;
- `schema.json`: grafo JSON-LD sincronizado com o HTML;
- `robots.txt`: política explícita para mecanismos de busca e mecanismos de resposta;
- `sitemap.xml`: URL canônica e data da revisão;
- `geo-validation-report.txt`: validações locais executadas;
- `GEO-README.md`: esta documentação.

## 3. Arquivos preservados sem alteração

Continuam sendo utilizadas as versões mais recentes já geradas no projeto:

- `assets/css/critical.css`;
- `assets/css/main.css`;
- `assets/js/app.js`;
- `assets/js/analytics.js`;
- `assets/js/consent.js`.

Nenhuma alteração em CSS ou JavaScript foi necessária. As novas informações reutilizam classes e componentes já existentes.

## 4. Estrutura orientada a respostas

Foi incluída uma seção visível de resumo com três respostas diretas:

1. o que é oferecido;
2. quanto custa;
3. onde e quando há atendimento.

A página também mantém blocos separados para:

- benefícios e contexto;
- escopo do serviço;
- preços;
- depoimentos;
- bairros;
- autoridade empresarial;
- perguntas frequentes;
- conversão pelo WhatsApp.

Essa organização reduz ambiguidade e facilita a extração de trechos autocontidos.

## 5. Linguagem e contexto

A redação usa:

- nomes completos das entidades;
- respostas curtas antes de detalhes;
- repetição controlada do serviço principal;
- bairros agrupados por região;
- preços associados às respectivas capacidades;
- horário escrito de forma consistente;
- limites do serviço declarados claramente;
- analogia obrigatória acompanhada de ressalva não médica.

Não foram adicionadas alegações clínicas, garantias, dados estatísticos, prazos técnicos ou informações não fornecidas.

## 6. Entidades

O grafo representa:

- `Organization`, `LocalBusiness` e `HVACBusiness` na mesma entidade;
- `Service`;
- três entidades `Offer`;
- `WebSite`;
- `WebPage`;
- `WebPageElement` para o resumo objetivo;
- nove entidades `Place`;
- `FAQPage`;
- `BreadcrumbList`;
- `ImageObject`;
- `Audience`;
- `ServiceChannel`;
- `SpeakableSpecification`.

Os bairros possuem `@id` próprios e são reutilizados em `areaServed` e `mentions`, evitando entidades duplicadas.

## 7. Perguntas e respostas

A FAQ visível e o `FAQPage` contêm as mesmas 11 perguntas e respostas. Elas cobrem:

- serviço;
- aparelhos;
- preços;
- condensadora;
- bairros;
- horário;
- agendamento;
- ausência de formulário;
- apartamentos e casas;
- outras especificações;
- limites do escopo.

## 8. Dados estruturados

O JSON-LD:

- permanece inline no `index.html`;
- é idêntico ao arquivo `schema.json`;
- utiliza URLs e `@id` canônicos;
- conecta empresa, serviço, ofertas, página, lugares e FAQ;
- mantém preços em BRL;
- marca o resumo e as respostas como conteúdo falável;
- não inclui `Review`, `AggregateRating`, `Person`, coordenadas, CEP, CNPJ ou redes sociais sem dados verificáveis.

## 9. Política de rastreamento

O `robots.txt` permite:

- Googlebot;
- Google-Extended;
- OAI-SearchBot;
- ChatGPT-User;
- Claude-SearchBot;
- Claude-User;
- PerplexityBot;
- Perplexity-User.

O arquivo bloqueia `GPTBot` e `ClaudeBot`, pois esses agentes de treinamento não são necessários para a descoberta nos respectivos mecanismos de busca.

Observação: `Google-Extended` reúne controles para grounding em produtos Gemini e treinamento. Nesta configuração, ele permanece permitido para atender ao objetivo expresso de otimização para Gemini.

## 10. Arquivo llms.txt

Não foi criado `llms.txt`. A implementação prioriza HTML rastreável, conteúdo textual, dados estruturados coerentes, sitemap e regras oficiais de crawler. Não foi introduzido um arquivo experimental como dependência de descoberta.

## 11. Limites

A otimização melhora clareza, consistência, rastreabilidade e elegibilidade técnica. Ela não garante indexação, citação, posição ou exibição em respostas geradas por IA. Essas decisões pertencem a cada plataforma e dependem também da publicação, rastreamento, reputação externa e atualização das informações.

## 12. Implantação

1. Fazer backup da versão publicada.
2. Substituir `index.html`.
3. Substituir `schema.json`.
4. Substituir `robots.txt`.
5. Substituir `sitemap.xml`.
6. Manter os CSS e JavaScript mais recentes nos caminhos atuais.
7. Confirmar HTTP 200 para a URL canônica e para as imagens.
8. Confirmar que nenhum firewall ou CDN bloqueia os agentes permitidos.
9. Validar a URL publicada no Schema Markup Validator e nas ferramentas dos mecanismos de busca.
10. Verificar os CTAs em mobile e desktop.

## 13. Manutenção

Sempre que preços, bairros, horário, serviço, CTA, URL ou perguntas forem alterados com autorização:

- atualizar o texto visível;
- atualizar `schema.json`;
- atualizar o JSON-LD inline;
- atualizar `lastmod` no sitemap;
- repetir a validação;
- preservar a correspondência exata entre FAQ visível e `FAQPage`.
