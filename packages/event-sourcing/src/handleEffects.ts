import { AppEvent } from './AppEvent';
import { effects } from './EffectStore';
import { publishEvent } from './publishEvent';

export async function handleEffects(event: AppEvent) {
  for (const effect of effects) {
    const collector: AppEvent[] = [];
    effect(event, (event) => {
      collector.push(event);
      return event;
    }).then(async (fn) => {
      for (const collectedEvent of collector) {
        await publishEvent({ event: collectedEvent, trigger: event });
      }
      fn?.();
    });
  }
}
