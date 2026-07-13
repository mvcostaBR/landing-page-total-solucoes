# Enhanced Conversions — estado de implementação

## Estado

**Não ativado nesta landing page.**

O briefing proíbe formulários e determina conversão exclusivamente por clique no WhatsApp. A página também não pode pedir nome ou e-mail. Enhanced Conversions depende de dados primários fornecidos pelo usuário, como e-mail, telefone, nome/endereço, enviados com hash para o Google. Como esses dados não existem no momento do clique, ativar o recurso no front-end exigiria inventar dados ou alterar o fluxo oficial do projeto.

## O que foi preparado

- Consent Mode v2 com `ad_user_data` e `ad_personalization`;
- espaço técnico para Google Ads via GTM ou Google tag;
- conversão padrão de clique em WhatsApp;
- auto-tagging e UTMs;
- arquitetura compatível com futura integração server-side.

## Caminho futuro permitido sem formulário na landing page

Uma implantação posterior pode usar Enhanced Conversions for Leads/integração offline quando um CRM ou processo autorizado receber, fora da landing page, dados de contato fornecidos pelo próprio lead e houver base jurídica/consentimento adequado. Isso requer projeto separado, política de privacidade revisada e validação jurídica. Nenhum dado do WhatsApp é capturado pelo código entregue.

## Atualização de plataforma

A documentação oficial do Google informa que as modalidades de Enhanced Conversions estão sendo unificadas em uma configuração única em 2026. A disponibilidade e os nomes da interface devem ser confirmados na conta no momento da implantação.
