import { limpo, renderizar } from '../../../../testing/renderizar';
import { DadosCaixinha } from '../../../core/dominio/tipos';
import { NbCaixinhaForm } from './caixinha-form';

const hoje = { ano: 2026, mes: 11 };

describe('NbCaixinhaForm (R-04.3)', () => {
  it('cria com ícone, nome, valor e prazo e mostra o sugerido ao vivo (U-04.2)', async () => {
    const r = await renderizar(NbCaixinhaForm, { hoje });
    const criar = () => r.qs<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === 'Criar caixinha')!;
    expect(criar().disabled).toBe(true);

    const nome = r.q<HTMLInputElement>('input[maxlength]');
    nome.value = 'Celular novo';
    nome.dispatchEvent(new Event('input'));
    r.qs<HTMLButtonElement>('nb-quick-amounts button')[2].click();
    await r.fixture.whenStable();
    expect(limpo(r.q('section').textContent)).toContain('R$ 285,72/mês');

    let dados: DadosCaixinha | undefined;
    r.instancia.salvar.subscribe((d) => (dados = d));
    criar().click();
    expect(dados).toEqual({ nome: 'Celular novo', icone: 'aparelho', metaCentavos: 200000, prazo: { ano: 2027, mes: 5 } });
  });

  it('nome vazio mostra erro ao sair do campo (U-01.4)', async () => {
    const r = await renderizar(NbCaixinhaForm, { hoje });
    expect(r.texto()).not.toContain('Dê um nome');
    r.q('input[maxlength]').dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('Dê um nome para a caixinha.');
  });

  it('em edição preenche e muda o texto do botão', async () => {
    const r = await renderizar(NbCaixinhaForm, {
      hoje, inicial: { nome: 'Viagem', icone: 'viagem', metaCentavos: 80000, prazo: { ano: 2027, mes: 1 } },
    });
    expect(r.q<HTMLInputElement>('input[maxlength]').value).toBe('Viagem');
    expect(r.q('[nb-icon-option][aria-pressed=true]').textContent).toContain('Viagem');
    expect(r.texto()).toContain('Salvar alterações');
  });
});
