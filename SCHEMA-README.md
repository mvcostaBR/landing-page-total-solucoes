# Schema.org — Total Soluções Prediais

## Escopo

Esta revisão foi preparada para a landing page canônica:

`https://www.totalsolucoesprediais.com.br/higienizacao-split`

O grafo representa exclusivamente:

- a Total Soluções Prediais;
- a higienização de ar condicionado residencial, exclusivamente para modelos Split;
- os três valores definidos no briefing;
- os bairros e o horário de atendimento definidos no briefing;
- a conversão exclusivamente pelo WhatsApp;
- as perguntas e respostas visíveis na landing page.

## Arquivos

- `schema.json`: fonte de manutenção do grafo JSON-LD;
- `index.html`: versão atualizada com o mesmo grafo inserido em `<script type="application/ld+json">`;
- `schema-validation-report.txt`: relatório da validação local, com resultado **APROVADO**.

## Entidades utilizadas

- `Organization`, `LocalBusiness` e `HVACBusiness` na mesma entidade empresarial, evitando duplicação de identidade;
- `Service` para o serviço único da landing page;
- três entidades `Offer`, uma para cada valor publicado;
- `WebSite` e `WebPage`;
- `FAQPage` com seis perguntas visíveis;
- `BreadcrumbList`;
- `SpeakableSpecification` aplicado à `WebPage` por seletores CSS;
- três `ImageObject`: logo, imagem principal e imagem social.

## Person

`Person` não foi incluído. Não há, nos documentos oficiais do projeto, uma pessoa cuja autoria, função institucional ou responsabilidade precise ser representada no grafo. Os nomes dos depoimentos continuam visíveis no HTML, mas não foram transformados em `Review` ou `Person` para evitar marcação adicional sem URL, data e identificadores verificáveis da publicação original.

## Organização, LocalBusiness e HVACBusiness

A empresa usa múltiplos tipos no mesmo `@id`:

```json
"@type": ["Organization", "LocalBusiness", "HVACBusiness"]
```

Isso mantém uma única entidade e explicita a hierarquia solicitada. `HVACBusiness` é aplicável ao contexto de climatização da empresa, enquanto o serviço descrito permanece limitado à higienização residencial de modelos Split.

## Speakable

A propriedade `speakable` utiliza `SpeakableSpecification` e seletores CSS que existem no HTML:

- título principal;
- parágrafos introdutórios do hero;
- títulos de serviço, preços, área de atendimento e FAQ;
- perguntas e respostas da FAQ.

Os seletores devem permanecer sincronizados caso classes ou IDs sejam alterados no futuro.

## Sincronização

O arquivo `schema.json` não deve ser carregado por `src` em um `<script>` como substituto do JSON-LD inline. Para máxima compatibilidade com rastreadores, o conteúdo deve permanecer inline no HTML. Nesta entrega, `schema.json` e o bloco do `index.html` são idênticos.

## Dados deliberadamente omitidos

Não foram inventados nem incluídos:

- CEP;
- latitude e longitude;
- CNPJ;
- URLs de redes sociais;
- URL do perfil do Google Business;
- datas dos depoimentos;
- `aggregateRating`;
- `Review`;
- `Person`;
- métodos de pagamento;
- disponibilidade ou validade futura das ofertas;
- promessas médicas.

## Arquivos preservados

Não foi necessária alteração em:

- `assets/css/critical.css`;
- `assets/css/main.css`;
- `assets/js/app.js`;
- `assets/js/analytics.js`;
- `assets/js/consent.js`.

## Validação de implantação

Após publicar os arquivos e confirmar que todas as URLs de imagem respondem com HTTP 200:

1. testar o HTML completo no Schema Markup Validator;
2. confirmar ausência de erros de sintaxe e propriedades desconhecidas;
3. verificar se todos os `@id` resolvem para o mesmo domínio canônico;
4. confirmar que as perguntas do `FAQPage` continuam visíveis e idênticas ao HTML;
5. confirmar que os seletores de `SpeakableSpecification` retornam elementos;
6. repetir a validação sempre que preços, horários, bairros, imagens, IDs ou classes forem alterados com autorização.
