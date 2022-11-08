export type EffectFn = <
  TEvent extends { type: string; version: number; payload: any },
>(
  event: TEvent,
  publishEvent: <
    TEvent extends { type: string; version: number; payload: any },
  >(
    event: TEvent,
  ) => TEvent,
) => Promise<void | (() => void)>;

export const effects = [] as EffectFn[];

export function registerEffect(effect: EffectFn) {
  effects.push(effect);
}
