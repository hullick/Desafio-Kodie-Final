# Plan 05: Perfil e privacidade

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Passos em checkbox (`- [ ]`).

**Objetivo:** a pessoa vê e edita o nome, troca a senha, entende quais dados o app guarda, sai e apaga a conta inteira.

**Arquitetura:** o nome é atualizado em `perfis` (grant de coluna do plan 01); a senha, com reautenticação + `auth.updateUser`; a exclusão, com reautenticação + RPC `excluir_minha_conta()` (`security definer`), que apaga `auth.users` do próprio uid e leva tudo em cascata.

**Stack:** a do plan 00.

**Spec:** `docs/specs/05-perfil-privacidade.md`

## Restrições globais

- Todas as do plan 00. Branch `feature/05-perfil`. Executar depois do plan 01.
- Palavra de confirmação: `EXCLUIR` (exata, maiúsculas).
- Mensagem final: "Sua conta e seus dados foram apagados".
- O e-mail aparece só para leitura. Não há "baixar meus dados" (pendência da v2 registrada em `docs/specs/05`).

## Foco de revisão

- Senha atual errada na troca ou na exclusão: "Senha atual incorreta", sem deslogar.
- Excluir com a palavra "excluir" em minúsculas: o botão continua desabilitado.
- Depois de excluir, voltar no navegador: não mostra dados em cache (o guard redireciona; limpar o estado dos serviços no `sair`).
- Sessão aberta em outro aparelho após a exclusão: a próxima chamada falha e leva ao login.
- Nome editado aparece na saudação do Início sem reload.

---

### Tarefa 1: RPC de exclusão de conta

**Arquivos:** criar `supabase/migrations/20261201000500_excluir_conta.sql`, `supabase/tests/05_excluir_conta.test.sql`

**Interfaces:**
- Produz: `public.excluir_minha_conta() returns void` (`security definer`, `set search_path = ''`, `delete from auth.users where id = auth.uid()`); se `auth.uid()` for nulo, `raise exception`; `revoke` de `public` e `anon`, `grant` só para `authenticated`.

- [ ] **Passo 1:** testes pgTAP: A, com perfil, lançamentos, caixinhas e movimentos, executa a função e depois todas as tabelas têm 0 linhas de A, enquanto as de B continuam intactas (contagem antes e depois); anônimo recebe erro de permissão; a função não aceita parâmetros (não há como apagar outra pessoa).
- [ ] **Passos 2 a 4:** FAIL → migração → PASS (`dbtest` completo).
- [ ] **Passo 5:** commit `feat(R-05.6): adiciona exclusão definitiva da própria conta`.

### Tarefa 2: `PerfilService`

**Arquivos:** criar `features/perfil/perfil.service.ts` + spec

**Interfaces:**
- Consome: `SUPABASE`, `AuthService`.
- Produz: `type Perfil = { nome; email; criadoEm: string; versaoPolitica; aceitePoliticaEm }`; `PerfilService { perfil: Signal<Perfil | null>; carregar(): Promise<void>; atualizarNome(nome): Promise<void>; alterarSenha(atual, nova): Promise<void>; excluirConta(senha): Promise<void> }`. `alterarSenha` e `excluirConta` reautenticam com `signInWithPassword` antes e lançam `ErroPerfil('Senha atual incorreta')` se falhar. `excluirConta` chama a RPC e depois `AuthService.sair()`.

- [ ] **Passo 1:** testes com o client mockado: a reautenticação falha → erro e sem `updateUser` nem RPC; o fluxo feliz da exclusão chama a RPC e depois `sair`; `atualizarNome` aplica `trim` e chama `AuthService.definirNome` (o Início lê `AuthService.nome`).
- [ ] **Passos 2 a 4:** FAIL → implementar → PASS.
- [ ] **Passo 5:** commit `feat(R-05.3): adiciona serviço de perfil`.

### Tarefa 3: telas do perfil

**Arquivos:** criar `features/perfil/{perfil,dados,senha,privacidade,excluir}/*` + specs; rotas `/perfil`, `/perfil/dados`, `/perfil/senha`, `/perfil/privacidade`, `/perfil/excluir`

**Interfaces:**
- Consome: `PerfilService`, validadores do plan 01, `rotuloMesCurto`, `environment.versao`, `nb-*`.

- [ ] **Passo 1:** testes de componente:
  - **perfil:** iniciais "LS" para "Larissa Santos" e "L" para "Lari"; "No NuBanko desde nov/2026"; itens "Seus dados", "Alterar senha", "Privacidade"; card com o texto do R-01.11; "Sair" e "Excluir minha conta" num grupo separado, com Excluir em `neg` (U-05.1); rodapé "NuBanko v{versao}".
  - **dados:** edita o nome com `nomeValidator`; o e-mail é `readonly`.
  - **senha:** campos atual, nova e confirmar, com a regra do R-01.2 e a mensagem de senha atual incorreta.
  - **privacidade:** listas "O que guardamos" (nome, e-mail, senha protegida, lançamentos e caixinhas que você cria) e "O que não coletamos" (CPF, telefone, endereço, localização, dados bancários), mais a versão e a data do aceite e o link da Política.
  - **excluir:** explica que é irreversível; o botão só habilita com `EXCLUIR` exato e a senha preenchida (U-05.2).
- [ ] **Passos 2 a 4:** FAIL → implementar seguindo `design/perfil_nubanko` sem os itens da tabela de divergências → PASS.
- [ ] **Passo 5:** commit `feat(R-05.1): adiciona telas de perfil e privacidade`.

### Tarefa 4: e2e e usabilidade

**Arquivos:** criar `web/e2e/05-perfil.spec.ts`

- [ ] **Passo 1:** testes Playwright:
  - `R-05.2` editar o nome reflete em "Olá, {nome}";
  - `R-05.3` trocar a senha, sair e entrar com a nova (e a antiga falha);
  - `R-05.5` sair → `/entrar` e `/inicio` redireciona;
  - `R-05.6` excluir → mensagem final; entrar de novo falha; `goBack()` não mostra dados;
  - `U-05.3` a página de privacidade cabe em 390×844 sem rolar mais de 1 tela (`scrollHeight <= 2 * innerHeight`);
  - `U-00.1/2/3` em todas as rotas do perfil.
- [ ] **Passos 2 a 4:** rodar → corrigir → PASS.
- [ ] **Passo 5:** atualizar a rastreabilidade e o registro de IA; commit `test(R-05.6): cobre perfil e privacidade ponta a ponta`.
