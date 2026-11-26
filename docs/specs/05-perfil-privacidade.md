# Spec 05: Perfil e privacidade

## Intenção

Dar à Lari controle e transparência sobre os dados dela: o que o app guarda, como trocar a senha, como sair e como apagar tudo. Isso sustenta a "confiança" que a persona exige *(resumo)* e os direitos de titular da LGPD.

## Requisitos

| ID | Requisito | Origem |
|----|-----------|--------|
| R-05.1 | O topo mostra o avatar com as iniciais, o nome, o e-mail e "No NuBanko desde {mês/ano}" (data real do cadastro). | mockup, ajustado |
| R-05.2 | "Seus dados" permite editar o nome. O e-mail aparece só para leitura na v1. | proposta: troca de e-mail exige fluxo de confirmação; fica fora da v1 |
| R-05.3 | "Alterar senha" pede a senha atual, a nova e a confirmação, com a regra do R-01.2. | mockup |
| R-05.4 | "Privacidade" mostra, em linguagem simples: quais dados coletamos (nome, e-mail, senha protegida, lançamentos e caixinhas que você cria), para quê, o que **não** coletamos, link para a Política completa e a data e versão do aceite. | resumo (coleta mínima, transparência) |
| R-05.5 | "Sair" encerra a sessão no aparelho e volta ao login. | mockup |
| R-05.6 | "Excluir minha conta" pede para digitar "EXCLUIR" e a senha. Apaga o usuário e, em cascata, todos os dados, de forma definitiva, via função `security definer` que só apaga `auth.uid()`. Termina no login com a mensagem "Sua conta e seus dados foram apagados". | proposta; LGPD art. 18 |
| R-05.7 | "Baixar meus dados" **não** entra (exportação está fora do escopo). Fica registrado como pendência de LGPD para a v2. | resumo |
| R-05.8 | O rodapé mostra a versão real do build. | proposta |

## Telas

Referência: `design/perfil_nubanko`, sem CPF, telefone, endereço, biometria, foto, "Nível Ouro", "Conta verificada" e categorias personalizáveis. O card "Privacidade em primeiro lugar" fica, com o texto verdadeiro do R-01.11.

## Usabilidade

| ID | Critério (testado) | Justificativa |
|----|--------------------|---------------|
| U-05.1 | Ações destrutivas (Sair, Excluir) ficam visualmente separadas e Excluir usa a cor de perigo | H5; evita toque acidental |
| U-05.2 | Excluir exige confirmação digitada e explica que é irreversível | H5; ação irreversível |
| U-05.3 | O texto de privacidade é legível por leigos (frases curtas, sem jargão jurídico) e cabe em uma tela | Persona; confiança |

## Testes mínimos

pgTAP para a função de exclusão (apaga só o próprio usuário e tudo em cascata, e B continua intacto); componente para os formulários; Playwright para editar o nome, alterar a senha (logar com a nova), sair, excluir a conta (e não conseguir mais logar) e as rotas protegidas depois do logout.
