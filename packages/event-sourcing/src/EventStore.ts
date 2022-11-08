import { AppEvent } from './AppEvent';
import { Model } from './Model';

let eventFn: (since?: Date) => Promise<AppEvent[]>;
let storeFn: (event: Omit<AppEvent, 'createdAt'>) => Promise<AppEvent>;

export async function getEvents(model: Model) {
  return eventFn(model.lastEvent);
}

export async function storeEvent(event: Omit<AppEvent, 'createdAt'>) {
  return storeFn(event);
}

export function setupStore(config: {
  getEvents: (since?: Date) => Promise<AppEvent[]>;
  storeEvent: (event: Omit<AppEvent, 'createdAt'>) => Promise<AppEvent>;
}) {
  eventFn = config.getEvents;
  storeFn = config.storeEvent;
}
