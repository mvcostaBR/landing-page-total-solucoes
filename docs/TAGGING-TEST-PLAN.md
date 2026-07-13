# Plano de testes — Tag Assistant, GTM Preview e GA4 DebugView

1. Abra a landing page sem consentimento: nenhuma tag opcional deve ser carregada.
2. Escolha “Somente necessários”: confirme ausência de GA4, Google Ads, Meta e Clarity.
3. Ative apenas Analytics: GA4/Clarity podem carregar; Google Ads e remarketing não.
4. Ative apenas Marketing: Google Ads/remarketing/Meta podem carregar; GA4/Clarity não.
5. Aceite todos: valide todas as integrações configuradas.
6. Clique em cada CTA: confirme `cta_type`, `cta_position` e `service_variant`.
7. Confirme `generate_lead` somente no escopo de Analytics e `google_ads_whatsapp_conversion` somente no escopo de Marketing.
8. Teste URL com o sufixo ValueTrack simulado e verifique UTMs no evento.
9. Confirme que valores brutos de GCLID/WBRAID/GBRAID não aparecem como parâmetros customizados.
10. Revogue preferências e repita os testes.
