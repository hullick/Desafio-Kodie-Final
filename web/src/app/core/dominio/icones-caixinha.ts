import { IconeNome } from './icones';
import { IconeCaixinha } from './tipos';

export interface OpcaoIconeCaixinha {
  readonly id: IconeCaixinha;
  readonly rotulo: string;
  readonly icone: IconeNome;
}

export const ICONES_CAIXINHA: readonly OpcaoIconeCaixinha[] = [
  { id: 'aparelho', rotulo: 'Aparelho', icone: 'smartphone' },
  { id: 'viagem', rotulo: 'Viagem', icone: 'plane' },
  { id: 'reserva', rotulo: 'Reserva', icone: 'shield' },
  { id: 'estudos', rotulo: 'Estudos', icone: 'graduation-cap' },
  { id: 'casa', rotulo: 'Casa', icone: 'house' },
  { id: 'carro', rotulo: 'Carro', icone: 'car' },
  { id: 'presente', rotulo: 'Presente', icone: 'gift' },
  { id: 'outro', rotulo: 'Outro', icone: 'piggy-bank' },
];

export function iconeDaCaixinha(id: IconeCaixinha): IconeNome {
  return ICONES_CAIXINHA.find((i) => i.id === id)?.icone ?? 'piggy-bank';
}
