import { limpo, renderizar } from '../../../../testing/renderizar';
import { DadosCaixinha } from '../../../core/dominio/tipos';
import { NbCaixinhaForm } from './caixinha-form';

const hoje = '2026-11-25';
const digitar = (el: HTMLInputElement, v: string, evento = 'input') => {
  el.value = v;
  el.dispatchEvent(new Event(evento));
};

describe('NbCaixinhaForm (R-04.3)', () => {
  it('cria com ícone, nome, valor e data e mostra o sugerido ao vivo (U-04.2)', async () => {
    const r = await renderizar(NbCaixinhaForm, { hoje });
    const criar = () => r.qs<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === 'Criar caixinha')!;
    expect(criar().disabled).toBe(true);

    digitar(r.q<HTMLInputElement>('input[maxlength]'), 'Celular novo');
    r.qs<HTMLButtonElement>('nb-quick-amounts button')[2].click();
    await r.fixture.whenStable();
    expect(limpo(r.q('section').textContent)).toContain('R$ 285,72/mês');

    digitar(r.q<HTMLInputElement>('input[type=date]'), '2027-03-15', 'change');
    await r.fixture.whenStable();
    expect(limpo(r.q('section').textContent)).toContain('R$ 400,00/mês');

    let dados: DadosCaixinha | undefined;
    r.instancia.salvar.subscribe((d) => (dados = d));
    criar().click();
    expect(dados).toEqual({ nome: 'Celular novo', icone: 'aparelho', metaCentavos: 200000, prazo: '2027-03-15' });
  });

  it('o seletor de data começa hoje e vai até 10 anos', async () => {
    const r = await renderizar(NbCaixinhaForm, { hoje });
    const data = r.q<HTMLInputElement>('input[type=date]');
    expect([data.min, data.max, data.value]).toEqual(['2026-11-25', '2036-11-25', '2027-05-25']);
  });

  it('data antes de hoje mostra erro e bloqueia (U-00.6)', async () => {
    const r = await renderizar(NbCaixinhaForm, { hoje });
    digitar(r.q<HTMLInputElement>('input[maxlength]'), 'Viagem');
    r.qs<HTMLButtonElement>('nb-quick-amounts button')[0].click();
    const data = r.q<HTMLInputElement>('input[type=date]');
    digitar(data, '2026-11-24', 'change');
    data.dispatchEvent(new Event('blur'));
    await r.fixture.whenStable();
    expect(r.texto()).toContain('Escolha uma data a partir de hoje (25/11/2026).');
    expect(r.qs<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === 'Criar caixinha')!.disabled).toBe(true);
  });

  it('mostra os 8 ícones numa grade de 4 colunas, sem rolagem lateral', async () => {
    const r = await renderizar(NbCaixinhaForm, { hoje });
    expect(r.qs('[nb-icon-option]')).toHaveLength(8);
    expect(r.q('fieldset > div').className).toContain('grid-cols-4');
    expect(r.q('fieldset').className).toContain('min-w-0');
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
      hoje, inicial: { nome: 'Viagem', icone: 'viagem', metaCentavos: 80000, prazo: '2027-01-10' },
    });
    expect(r.q<HTMLInputElement>('input[maxlength]').value).toBe('Viagem');
    expect(r.q<HTMLInputElement>('input[type=date]').value).toBe('2027-01-10');
    expect(r.q('[nb-icon-option][aria-pressed=true]').textContent).toContain('Viagem');
    expect(r.texto()).toContain('Salvar alterações');
  });
});
