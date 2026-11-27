import { Component, computed, input } from '@angular/core';
import {
  LucideArrowDown, LucideArrowLeft, LucideArrowUp, LucideBanknote, LucideBus, LucideCalendar, LucideCar, LucideCheck,
  LucideChevronLeft, LucideChevronRight, LucideCircle, LucideCircleAlert, LucideCircleCheck, LucideCoins, LucideDelete,
  LucideDynamicIcon, LucideEllipsis, LucideEllipsisVertical, LucideEye, LucideEyeOff, LucideGift, LucideGraduationCap,
  LucideHeartPulse, LucideHouse, LucideIcon, LucideIdCard, LucideKeyRound, LucideLightbulb, LucideLock, LucideLogOut,
  LucideMail, LucidePencilLine, LucidePiggyBank, LucidePlane, LucidePlus, LucideReceiptText, LucideShield,
  LucideShieldCheck, LucideShoppingBag, LucideSmartphone, LucideTarget, LucideTicket, LucideTrash2, LucideTrophy,
  LucideUser, LucideUtensils, LucideWallet, LucideX,
} from '@lucide/angular';
import { IconeNome } from '../../../core/dominio/icones';

/** Registro fechado de ícones: só entra no bundle o que está aqui. */
export const ICONES: Record<IconeNome, LucideIcon> = {
  utensils: LucideUtensils, bus: LucideBus, ticket: LucideTicket, 'shopping-bag': LucideShoppingBag,
  'receipt-text': LucideReceiptText, 'heart-pulse': LucideHeartPulse, 'graduation-cap': LucideGraduationCap,
  ellipsis: LucideEllipsis, wallet: LucideWallet, coins: LucideCoins, gift: LucideGift, smartphone: LucideSmartphone,
  plane: LucidePlane, shield: LucideShield, house: LucideHouse, car: LucideCar, 'piggy-bank': LucidePiggyBank,
  plus: LucidePlus, user: LucideUser, eye: LucideEye, 'eye-off': LucideEyeOff, 'chevron-left': LucideChevronLeft,
  'chevron-right': LucideChevronRight, 'arrow-up': LucideArrowUp, 'arrow-down': LucideArrowDown,
  'arrow-left': LucideArrowLeft, calendar: LucideCalendar, 'pencil-line': LucidePencilLine, delete: LucideDelete,
  'ellipsis-vertical': LucideEllipsisVertical, trophy: LucideTrophy, lightbulb: LucideLightbulb, lock: LucideLock,
  mail: LucideMail, 'shield-check': LucideShieldCheck, 'log-out': LucideLogOut, 'trash-2': LucideTrash2,
  'key-round': LucideKeyRound, 'id-card': LucideIdCard, check: LucideCheck, circle: LucideCircle,
  'circle-check': LucideCircleCheck, x: LucideX, banknote: LucideBanknote, target: LucideTarget,
  'circle-alert': LucideCircleAlert,
};

/**
 * Átomo: ícone linear. Decorativo por padrão (aria-hidden);
 * passe `rotulo` só quando o ícone substitui um texto.
 */
@Component({
  selector: 'nb-icon',
  imports: [LucideDynamicIcon],
  template: `<svg [lucideIcon]="svg()" [size]="tamanho()" [strokeWidth]="espessura()" [title]="rotulo()"></svg>`,
  host: { class: 'inline-flex shrink-0' },
})
export class NbIcon {
  readonly nome = input.required<IconeNome>();
  readonly tamanho = input(20);
  readonly espessura = input(1.75);
  readonly rotulo = input<string | undefined>(undefined);
  protected readonly svg = computed(() => ICONES[this.nome()]);
}
