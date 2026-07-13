# Contrato de eventos — dataLayer

## Conversão

### `google_ads_whatsapp_conversion`
Disparado somente quando o consentimento de Marketing está concedido.

Parâmetros: `method`, `lead_channel`, `cta_type`, `cta_position`, `cta_label`, `service`, `service_variant`, `page_path`, UTMs permitidos e indicadores booleanos de click IDs.

### `generate_lead`
Disparado somente quando o consentimento de Analytics está concedido. Deve ser marcado como evento principal no GA4.

### `whatsapp_click`
Evento analítico para comparar posições e tipos de CTA. Não deve ser uma segunda conversão primária no Google Ads.

## Engajamento

- `faq_open`
- `section_view`
- `scroll_depth`

## Parâmetros proibidos

Nome, e-mail, telefone, mensagem do WhatsApp, URL completa e valores brutos de `gclid`, `wbraid` ou `gbraid`.

## Deduplicação

Use a conversão direta do Google Ads como **Primária** e a conversão importada do GA4 como **Secundária**, ou escolha apenas uma das duas. Não use ambas como sinais primários de lance.
