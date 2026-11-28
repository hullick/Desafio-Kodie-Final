# Changelog

Todas as mudanças relevantes do NuBanko ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/) (`MAJOR.MINOR.PATCH`):

- **MAJOR**: mudança incompatível (ex.: contrato da API que quebra clientes, migração que exige ação manual).
- **MINOR**: funcionalidade nova, compatível com a versão anterior.
- **PATCH**: correção de defeito, sem funcionalidade nova.

A versão fica em `package.json` e `web/package.json` (o Perfil mostra a do build) e cada lançamento
ganha a tag `vX.Y.Z` no `master`. Como lançar uma versão: `DESENVOLVIMENTO.md`, seção 14.

## [Não lançado]

### Corrigido
- Cadastro, login e todo `/api/auth/*` respondiam 502 em produção: o pooler do Netlify DB (Neon)
  recusa o parâmetro `search_path` na conexão. O `search_path` do papel `nubanko_auth` passa a
  ser definido no banco (`scripts/preparar-banco-netlify.sh`), e o código não o envia mais.
  **Antes do deploy**, rode o script de novo no banco de produção (DESENVOLVIMENTO.md, seção 14).

## [1.0.1] - 2026-11-27

### Corrigido
- Login e cadastro mandam para o início quem já está com a sessão ativa (inclusive com o cookie
  válido ao reabrir o site). Quem está sem sessão e abre o site cai no login.
- Os links entre login e cadastro aparecem sem rolar a tela: "Criar conta" logo abaixo do
  formulário de login e "Já tem uma conta? Entrar" no topo do cadastro.

### Alterado
- O deploy de produção acontece só com o push de uma tag `vX.Y.Z` no `master`, pelo GitHub
  Actions (`.github/workflows/deploy.yml`), que confere versão e changelog e roda os testes antes.
  Os builds que a Netlify dispararia a cada push são cancelados (`ignore` no `netlify.toml`).

## [1.0.0] - 2026-11-27

Primeira versão: PWA de controle financeiro para quem está no primeiro salário ou estágio.

### Adicionado

**Conta e acesso (spec 01)**
- Cadastro numa tela só (nome, e-mail, senha e aceite da política), sem confirmação de e-mail: a
  pessoa já entra na conta.
- Senha com 8+ caracteres, 1 número e 1 símbolo, com indicador ao digitar.
- Login com mensagem neutra ("E-mail ou senha incorretos.") e limite de tentativas.
- Rotas internas exigem sessão; sem ela, vai para o login e volta para a rota pedida depois.
- Sessão em cookie `HttpOnly`, `Secure` e `SameSite=Lax`; o token nunca aparece no corpo das respostas.

**Lançamentos (spec 02)**
- Botão "+" que abre o registro de gasto ou entrada de qualquer aba.
- Teclado numérico próprio, preenchido em centavos da direita para a esquerda.
- Categoria obrigatória por tipo, descrição opcional (até 60 caracteres) e data sem futuro.
- Lista do mês agrupada por dia, com edição e exclusão.

**Painel do mês (spec 03)**
- Saudação, seletor de mês (sem avançar além do atual) e saldo com entradas e gastos.
- Botão para esconder os valores, salvo só no aparelho.
- Rosca de gastos por categoria com percentuais que somam 100,0%.
- Caixinhas mais próximas do prazo e últimos 4 lançamentos.

**Caixinhas (spec 04)**
- Caixinhas com ícone, nome, meta e prazo, com sugestão de quanto guardar por mês.
- Guardar e retirar, com retirada limitada ao saldo e validada no banco.
- Edição, e exclusão só com saldo zero.

**Perfil e privacidade (spec 05)**
- Perfil com iniciais, nome, e-mail e data de cadastro; edição do nome.
- Alterar senha (pede a atual e desconecta os outros aparelhos).
- Excluir a conta, digitando "EXCLUIR" e a senha: apaga a pessoa e todos os dados dela.
- Texto de privacidade e versão do build no rodapé.
- Telas "Esqueci a senha" e "Nova senha", prontas para quando houver SMTP. **Desligadas em
  produção nesta versão**: sem SMTP, o link não aparece e as rotas da API respondem 404.

**Segurança e dados**
- Postgres com RLS em todas as tabelas: cada pessoa só lê e altera os próprios dados, mesmo se o
  código esquecer um filtro. As functions conectam com papéis sem `BYPASSRLS`.
- Textos livres (nome do perfil, nomes de caixinhas e descrições) cifrados com AES-256-GCM, chave
  por pessoa; o banco recusa esses campos em texto puro.
- Escritas vindas de outro site recebem `403` (proteção contra CSRF).

**API e plataforma**
- API em Netlify Functions (`/api/*`) com Better Auth em `/api/auth/*`.
- Contrato OpenAPI 3.1 em `docs/api/openapi.yaml`, com todos os erros documentados.
- PWA com service worker; telas pensadas para 360×740.
- Deploy na Netlify a partir do `master`, com script para preparar o Netlify DB
  (`scripts/preparar-banco-netlify.sh`).
- Ambiente local com Docker Compose (Postgres, migrações, Mailpit e `netlify dev`).

**Qualidade**
- Testes de banco (pgTAP), da API (Vitest, com duas contas provando o isolamento), do front
  (Vitest, ~99% de linhas) e E2E (Playwright com checagem de acessibilidade axe) em 360×740 e 390×844.

[Não lançado]: https://github.com/hullick/Desafio-Kodie-Final/compare/v1.0.1...develop
[1.0.1]: https://github.com/hullick/Desafio-Kodie-Final/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/hullick/Desafio-Kodie-Final/releases/tag/v1.0.0
