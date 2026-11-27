# ADR 0001: backend na Netlify em vez do Supabase

- **Data:** 2026-11-26
- **Status:** aceita pelo time; os detalhes técnicos marcados como *(proposta)* nas specs ainda podem ser revisados

## Contexto

As specs e os plans foram escritos com o Supabase como backend completo: Postgres, Auth (GoTrue), API automática (PostgREST) e RLS, testados com pgTAP num compose de self-hosting. O time decidiu concentrar a hospedagem, a API e o CI/CD na **Netlify**, sem Supabase.

## Decisão

| Peça | Antes | Agora |
|------|-------|-------|
| Hospedagem do front | (não definida) | Netlify, com deploy previews por PR |
| API | PostgREST automático | **Netlify Functions** em `/api/*`, uma por recurso |
| Banco | Postgres do Supabase | **Netlify DB** (Postgres gerenciado pela Neon); `postgres:17` localmente |
| Autenticação | Supabase Auth (GoTrue) | **Better Auth** numa function em `/api/auth/*`, tabelas no schema `auth` |
| Isolamento por usuário | RLS com `auth.uid()` | `comUsuario` no código **e** RLS com `app.usuario_id()` (variável de transação) |
| Ambiente local | Compose do Supabase (8 serviços) | Compose com `db`, `migrate`, `mail` e `app` (`netlify dev`) |

**Por que manter o RLS:** sem PostgREST, o banco não fica exposto ao navegador, e o RLS deixaria de ser obrigatório. Mas um único endpoint que esqueça o filtro `user_id` vazaria dados de outra pessoa, que é o anti-objetivo principal da spec 00. Com as functions conectando por um papel sem `BYPASSRLS` e o id do usuário gravado por transação, o banco continua barrando esse erro, e os testes pgTAP com dois usuários continuam valendo.

**Por que Better Auth:** é open source, guarda tudo no nosso Postgres (sem mais um fornecedor com dados pessoais, R-00.5), roda dentro de uma function e funciona offline no Docker, com cadastro, confirmação de e-mail, redefinição de senha, troca de senha, exclusão de conta e rate limit prontos.

## Consequências

- **Mais código nosso:** cada endpoint é escrito à mão. Para compensar, cada plan ganha uma tarefa de API com testes de integração A/B, e um guarda estático exige `comUsuario` em toda function de domínio.
- **E-mail:** sem o SMTP embutido do Supabase, é preciso contratar um provedor de SMTP para produção.
- **Ambiente local menos fiel:** `netlify dev` emula a plataforma, mas não reproduz timeout, cold start e limites. Isso é validado nos deploy previews.
- **Conexões:** functions serverless abrem muitas conexões. Por isso usam a URL **pooled** do Neon, e as migrações usam a direta.
- **Dependência da Netlify:** as functions são handlers `Request → Response` padrão e o banco é Postgres comum. Migrar para Vercel ou outro provedor exige trocar a pasta e a config, não reescrever a lógica.
- **O front quase não muda:** os repositórios abstratos de `web/src/app/core/dados/` ganham uma implementação HTTP no lugar da do Supabase.

## Alternativas consideradas

- **Manter o Supabase e usar a Netlify só para o front:** menos código, mas o time preferiu não depender de dois provedores.
- **Vercel:** equivalente em funções e CI/CD. A Netlify foi escolhida por emular melhor localmente (`netlify dev` sem login) e por permitir uso comercial no plano gratuito.
- **Isolamento só no código, sem RLS:** mais simples, mas sem rede de proteção. Descartado pelo motivo acima.
