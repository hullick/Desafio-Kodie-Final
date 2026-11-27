import { hojeISO } from '../../../core/tempo/mes';
import { renderizar } from '../../../../testing/renderizar';
import { NbDateChip } from './date-chip';

describe('NbDateChip (R-02.6)', () => {
  it('mostra Hoje e rejeita datas futuras', async () => {
    const r = await renderizar(NbDateChip, { data: hojeISO(), max: '2026-11-25', rotuloAcessivel: 'Data do lançamento' });
    expect(r.texto()).toContain('Hoje');
    const input = r.q<HTMLInputElement>('input');
    expect(input.max).toBe('2026-11-25');
    expect(input.getAttribute('aria-label')).toBe('Data do lançamento');
    input.value = '2026-11-30';
    input.dispatchEvent(new Event('change'));
    expect(r.instancia.data()).toBe(hojeISO());
    input.value = '2026-11-05';
    input.dispatchEvent(new Event('change'));
    await r.fixture.whenStable();
    expect(r.instancia.data()).toBe('2026-11-05');
    expect(r.texto()).toContain('5 de nov.');
  });
});
