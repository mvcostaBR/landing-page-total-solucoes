# Landing Page preparada para Google Ads — Total Soluções Prediais

## Escopo preservado

A entrega mantém o serviço exclusivamente como **Higienização de Ar Condicionado Residencial, modelos Split**, sem formulários. Preços, bairros, horário, CTA principal, CTA secundário e mensagens de WhatsApp permanecem exatamente conforme o briefing.

A identidade visual usa azul-marinho, dourado, branco e off-white, com tipografia serifada de destaque e comunicação premium orientada a Engenharia, limpeza e confiança.

## Arquivos atualizados

- `index.html`
- `assets/css/critical.css`
- `assets/css/main.css`
- `assets/js/app.js`
- `assets/js/consent.js`
- `assets/js/analytics.js`
- `schema.json`
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`

## Arquivos de Google Ads adicionados

- `config/measurement-ids.example.json`
- `config/gtm-blueprint.json`
- `config/ga4-events.json`
- `config/google-ads-conversions.json`
- `config/utm-policy.json`
- `config/final-url-suffix.txt`
- `config/remarketing-audiences.json`
- `docs/DATALAYER-CONTRACT.md`
- `docs/ENHANCED-CONVERSIONS.md`
- `docs/PUBLICATION-CHECKLIST.md`
- `docs/TAGGING-TEST-PLAN.md`

## Conversão principal

O clique em qualquer CTA do WhatsApp gera dois fluxos condicionados:

- `generate_lead` e `whatsapp_click` quando Analytics está autorizado;
- `google_ads_whatsapp_conversion` quando Marketing está autorizado.

A separação impede que consentimento de Analytics seja usado como autorização publicitária e permite configurar tags independentes no GTM.

## Configuração recomendada

1. Crie/obtenha os IDs oficiais.
2. Preencha apenas `data-gtm-id` no `index.html` quando o GTM centralizar todas as tags.
3. Implemente o arquivo `config/gtm-blueprint.json` no container.
4. Configure o sufixo de URL em `config/final-url-suffix.txt`.
5. Execute o checklist e o plano de testes.

## Enhanced Conversions

O recurso não foi ativado. A landing page não coleta dados primários do usuário e não possui formulário. Consulte `docs/ENHANCED-CONVERSIONS.md`.

## Observação de implantação

Os IDs permanecem vazios porque nenhum identificador oficial foi fornecido. A página funciona normalmente sem mensuração externa; as integrações são ativadas somente após o preenchimento dos IDs e o consentimento correspondente.
