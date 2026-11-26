# Spec 01: Login e cadastro

## Intenção

Deixar a Lari entrar em menos de um minuto e garantir que tudo o que ela registrar seja só dela. É o requisito transversal do resumo.

## Escopo

Cadastro, confirmação de e-mail, login, logout, recuperação de senha e proteção de rotas.
Fora: login social, biometria, CPF, "lembrar meu acesso" (a sessão já persiste, ver R-01.6).

## Requisitos

| ID | Requisito | Origem |
|----|-----------|--------|
| R-01.1 | O cadastro pede **nome** (como prefere ser chamada, 2 a 40 caracteres), **e-mail**, **senha**, **confirmação de senha** e **aceite** dos Termos e da Política de Privacidade. | resumo + mockup |
| R-01.2 | A senha tem 8+ caracteres, 1 número e 1 símbolo, validada no front (indicador ao vivo) **e** no servidor (hook do Better Auth no cadastro, na redefinição e na troca de senha, usando a mesma função `checarSenha`). | mockup |
| R-01.3 | Sem aceite, o botão de cadastro fica desabilitado. O aceite grava `aceite_politica_em` e `versao_politica` em `perfis`. | resumo (LGPD) |
| R-01.4 | E-mail já cadastrado mostra uma mensagem neutra: "Se esse e-mail puder ser usado, você receberá um link". Não revela quais e-mails existem, nem na tela nem na resposta da API: um hook do servidor troca o erro de "usuário já existe" pela mesma resposta de sucesso. | proposta |
| R-01.5 | O cadastro exige confirmação por e-mail antes do primeiro login. Localmente, o e-mail chega no Mailpit. | proposta |
| R-01.6 | O login é por e-mail e senha. A sessão (cookie `HttpOnly` do Better Auth) persiste no aparelho até o logout ou a expiração, e é renovada enquanto a pessoa usa o app. | resumo |
| R-01.7 | Erro de login mostra sempre "E-mail ou senha incorretos", sem dizer qual dos dois. | proposta |
| R-01.8 | "Esqueci a senha" envia um link de redefinição. A nova senha segue R-01.2. | proposta: sem isso, quem esquece perde todos os dados |
| R-01.9 | As rotas internas (Início, Caixinhas, Perfil, "+") exigem sessão. Sem sessão, redirecionam para o login e voltam à rota pedida depois de entrar. | resumo |
| R-01.10 | A tabela `perfis(id = auth."user".id, nome, aceite_politica_em, versao_politica, criado_em)` é criada por trigger no cadastro, com RLS de dono. O aceite chega pelo campo adicional `aceiteVersao` do usuário no Better Auth. | proposta |
| R-01.11 | Textos de segurança só dizem o que é verdade: "Senha protegida e conexão segura (HTTPS)". | time (divergência do mockup) |
| R-01.12 | Rate limiting de login, cadastro e recuperação de senha, usando o rate limit do Better Auth com armazenamento **no banco** (em serverless, a memória não é compartilhada entre instâncias). | proposta |

## Telas

Referências: `design/login_nubanko`, `design/cadastro_nubanko`, respeitando as divergências do README. Topo turquesa com o logo "NuBanko." e o slogan, formulário em card branco, botão "Entrar" e link "Criar conta". O cadastro tem o indicador de força da senha com os três checks.

## Usabilidade

| ID | Critério (testado) | Justificativa |
|----|--------------------|---------------|
| U-01.1 | Cadastro completo em uma tela só, com 5 campos e 1 aceite, sem etapas | Persona abandona tarefas longas; H8 (minimalismo) |
| U-01.2 | Os checks de senha atualizam a cada tecla, antes do envio | H5 (prevenção de erros) |
| U-01.3 | Os campos usam `type=email`, `autocomplete` correto e "mostrar senha" | Teclado certo no celular; gerenciador de senhas; H7 (eficiência) |
| U-01.4 | Erro de validação aparece ao sair do campo, não a cada tecla | H9; evita "gritar" com quem ainda está digitando |
| U-01.5 | Depois do login, Início aparece com o saldo em ≤ 2 s (dev local) | H1 |

## Testes mínimos

pgTAP para o trigger de `perfis` e a RLS (A não lê o perfil de B); integração para a configuração do Better Auth (senha fraca recusada no servidor, e-mail existente com resposta neutra, rate limit); unidade para os validadores de senha e de nome; componente para os formulários; Playwright para cadastro, confirmação via Mailpit, login, logout, recuperação de senha e redirecionamento de rota protegida.
