import { ICONES_CAIXINHA, iconeDaCaixinha } from './icones-caixinha';

describe('ícones de caixinha', () => {
  it('oferece 8 opções e mapeia para ícone', () => {
    expect(ICONES_CAIXINHA).toHaveLength(8);
    expect(iconeDaCaixinha('viagem')).toBe('plane');
    expect(iconeDaCaixinha('xpto' as never)).toBe('piggy-bank');
  });
});
