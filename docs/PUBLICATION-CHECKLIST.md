# Checklist de publicação — Google Ads

## 1. Identificadores e propriedade

- [ ] Inserir o ID oficial do GTM em `data-gtm-id` no `index.html`.
- [ ] Manter `data-ga4-id`, `data-google-ads-id`, `data-google-ads-label`, Meta e Clarity vazios quando todas as tags forem gerenciadas pelo GTM.
- [ ] Confirmar propriedade GA4 e stream Web corretos.
- [ ] Vincular GA4 e Google Ads com as permissões necessárias.
- [ ] Ativar auto-tagging no Google Ads.

## 2. GTM

- [ ] Configurar Google tag/GA4.
- [ ] Configurar Conversion Linker.
- [ ] Configurar conversão Google Ads para `google_ads_whatsapp_conversion`.
- [ ] Configurar evento GA4 `generate_lead`.
- [ ] Configurar remarketing geral com verificações de consentimento.
- [ ] Confirmar que nenhuma tag de Analytics dispara sem `analytics_storage=granted`.
- [ ] Confirmar que nenhuma tag publicitária dispara sem `ad_storage`, `ad_user_data` e, para remarketing, `ad_personalization`.
- [ ] Publicar somente uma versão aprovada do container.

## 3. Google Ads e GA4

- [ ] Criar ação de conversão direta para clique no WhatsApp.
- [ ] Definir a ação direta como Primária, se ela for o sinal de lance escolhido.
- [ ] Marcar `generate_lead` como evento principal no GA4.
- [ ] Importar `generate_lead` para o Google Ads e deixá-lo como Secundário, caso a conversão direta seja Primária.
- [ ] Não atribuir valor de receita ao clique sem regra comercial validada.
- [ ] Não ativar Enhanced Conversions no front-end desta página.

## 4. UTM e URL

- [ ] Aplicar o `final-url-suffix.txt` no nível de conta ou campanha.
- [ ] Confirmar que a URL final é a canonical oficial.
- [ ] Testar preservação de `gclid`, `wbraid` e `gbraid` pelo servidor e por redirecionamentos.
- [ ] Confirmar que nenhum redirecionamento remove query strings.

## 5. Remarketing

- [ ] Criar fonte de público do site.
- [ ] Criar listas por comportamento, sem inferir condições médicas ou dados sensíveis.
- [ ] Excluir conversores de campanhas de aquisição quando aplicável.
- [ ] Confirmar limites mínimos de público na própria conta antes de ativar campanhas.

## 6. QA técnico

- [ ] Executar Preview do GTM e validar cada estado de consentimento.
- [ ] Validar Consent Mode com Tag Assistant.
- [ ] Clicar em todos os CTAs e confirmar posição/tipo/variante.
- [ ] Confirmar um único disparo de conversão por clique.
- [ ] Confirmar que o WhatsApp abre com as mensagens oficiais intactas.
- [ ] Testar mobile e desktop.
- [ ] Validar console sem erros e rede sem tags duplicadas.
- [ ] Executar Lighthouse/PageSpeed no ambiente publicado.
- [ ] Confirmar canonical, robots, sitemap, schema e assets HTTP 200.

## 7. Pós-publicação

- [ ] Aguardar o diagnóstico de tags do Google Ads.
- [ ] Confirmar recebimento de eventos no DebugView do GA4.
- [ ] Confirmar ações de conversão sem alerta de inatividade.
- [ ] Monitorar discrepância entre cliques de WhatsApp, eventos GA4 e conversões Google Ads.
- [ ] Revisar termos de pesquisa, qualidade dos leads e taxa de conversão.
