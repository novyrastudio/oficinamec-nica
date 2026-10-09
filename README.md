# Automotive Luxe — Novyra Studio

Website premium reutilizável para oficinas mecânicas e centros automotivos. A base é estática, sem backend obrigatório, com orçamento via WhatsApp, consentimento de Analytics/mídia e política de privacidade editável.

## Executar

No Windows, você também pode abrir `abrir-site.bat` com duplo clique. Ele inicia o servidor local e abre o site no navegador.

```bash
npm run dev
npm run lint
npm test
npm run build
```

O servidor local usa `http://localhost:4173` por padrão e tenta a próxima porta livre se ela já estiver ocupada.

## Configuração principal

Edite [src/scripts/config.js](src/scripts/config.js) antes de publicar:

- `brand`: nome, texto do logotipo e descrição.
- `seo`: domínio canônico, title, description e Open Graph.
- `contact.whatsapp.number`: número em formato internacional, apenas dígitos, por exemplo `5511999999999`.
- `contact.whatsapp.isDemoNumber`: altere para `false` somente quando o número real estiver configurado.
- `contact`: telefone, endereço, mapa, horários e contato de privacidade.
- `services`: serviços ativos, ordem, nomes e descrições.
- `gallery`: imagens demonstrativas que devem ser trocadas por fotos autorizadas do cliente.
- `reviews`: avaliações reais autorizadas; deixe vazio para não exibir prova social fictícia em produção.
- `analytics.ga4Id` e `analytics.gtmId`: IDs públicos opcionais. Deixe vazio se não houver medição.

## Privacidade e WhatsApp

O formulário de orçamento não envia dados para backend, Analytics, publicidade, cookies ou localStorage. Ele valida os campos e monta um link `wa.me` para o visitante confirmar manualmente o envio dentro do WhatsApp.

Tags opcionais de Analytics e mídia só são carregadas depois do consentimento aplicável. As preferências são salvas em `localStorage` quando disponível, com fallback por cookie e memória de sessão se o navegador bloquear ambos.

## Publicação

O build copia os arquivos para `dist/` e gera `robots.txt` e `sitemap.xml` com base em `seo.siteUrl`. Antes de subir para produção, substitua todos os campos demonstrativos e revise a política em [privacidade/index.html](privacidade/index.html).
