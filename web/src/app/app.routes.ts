import { Routes } from '@angular/router';
import { exigirSessao } from './core/sessao/exigir-sessao.guard';

/** Cada rota carrega uma página (lazy). As abas logadas ficam dentro da casca (ShellPage). */
export const routes: Routes = [
  { path: 'entrar', title: 'Entrar · NuBanko', loadComponent: () => import('./pages/entrar/entrar.page').then((m) => m.EntrarPage) },
  { path: 'cadastro', title: 'Criar conta · NuBanko', loadComponent: () => import('./pages/cadastro/cadastro.page').then((m) => m.CadastroPage) },
  {
    path: 'esqueci-senha', title: 'Esqueci a senha · NuBanko',
    loadComponent: () => import('./pages/esqueci-senha/esqueci-senha.page').then((m) => m.EsqueciSenhaPage),
  },
  {
    path: 'nova-senha', title: 'Nova senha · NuBanko',
    loadComponent: () => import('./pages/nova-senha/nova-senha.page').then((m) => m.NovaSenhaPage),
  },
  {
    path: 'privacidade', title: 'Privacidade · NuBanko',
    loadComponent: () => import('./pages/privacidade/privacidade.page').then((m) => m.PrivacidadePage),
  },
  {
    path: '',
    canActivate: [exigirSessao],
    loadComponent: () => import('./pages/shell/shell.page').then((m) => m.ShellPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', title: 'Início · NuBanko', loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage) },
      {
        path: 'lancamentos', title: 'Lançamentos · NuBanko',
        loadComponent: () => import('./pages/lancamentos/lancamentos.page').then((m) => m.LancamentosPage),
      },
      { path: 'caixinhas', title: 'Caixinhas · NuBanko', loadComponent: () => import('./pages/caixinhas/caixinhas.page').then((m) => m.CaixinhasPage) },
      {
        path: 'caixinhas/nova', title: 'Nova caixinha · NuBanko',
        loadComponent: () => import('./pages/caixinha-form/caixinha-form.page').then((m) => m.CaixinhaFormPage),
      },
      {
        path: 'caixinhas/:id', title: 'Caixinha · NuBanko',
        loadComponent: () => import('./pages/caixinha-detalhe/caixinha-detalhe.page').then((m) => m.CaixinhaDetalhePage),
      },
      {
        path: 'caixinhas/:id/editar', title: 'Editar caixinha · NuBanko',
        loadComponent: () => import('./pages/caixinha-form/caixinha-form.page').then((m) => m.CaixinhaFormPage),
      },
      { path: 'perfil', title: 'Perfil · NuBanko', loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage) },
      {
        path: 'perfil/dados', title: 'Seus dados · NuBanko',
        loadComponent: () => import('./pages/perfil-dados/perfil-dados.page').then((m) => m.PerfilDadosPage),
      },
      {
        path: 'perfil/senha', title: 'Alterar senha · NuBanko',
        loadComponent: () => import('./pages/alterar-senha/alterar-senha.page').then((m) => m.AlterarSenhaPage),
      },
      {
        path: 'perfil/excluir', title: 'Excluir minha conta · NuBanko',
        loadComponent: () => import('./pages/excluir-conta/excluir-conta.page').then((m) => m.ExcluirContaPage),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
