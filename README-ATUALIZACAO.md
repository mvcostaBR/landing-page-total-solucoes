# Atualização da Landing Page - Total Soluções Prediais

## Publicação no GitHub Pages

1. Substitua o arquivo `index.html` da raiz.
2. Substitua integralmente as pastas `assets/css`, `assets/js`, `assets/img` e `assets/icons`.
3. Substitua `schema.json`, `site.webmanifest`, `robots.txt`, `sitemap.xml` e `favicon.ico`.
4. Mantenha o arquivo `.nojekyll` na raiz do repositório.
5. Confirme que os nomes e a capitalização das pastas permanecem exatamente como no pacote.
6. Após o commit, aguarde a atualização do GitHub Pages e faça uma recarga forçada no navegador:
   - Windows/Linux: `Ctrl + F5`
   - macOS: `Cmd + Shift + R`

## Estrutura preparada para GitHub Pages

Todos os caminhos de CSS, JavaScript e imagens são relativos (`./assets/...`). Isso permite a publicação no subdiretório:

`https://mvcostabr.github.io/landing-page-total-solucoes/`

## Mensuração

Os campos de IDs no elemento `#tsp-analytics` estão vazios. Preencha apenas os IDs oficiais quando forem disponibilizados. Com GTM ativo, mantenha os IDs diretos vazios para evitar eventos duplicados.
