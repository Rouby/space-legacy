import { vi } from 'vitest';
import type { AppEvent } from '../../logic/events';

export const mockGameEvents = vi.fn(async () => [] as AppEvent[]);

export function getDbClient() {
  return {
    gameEvent: {
      findMany: () =>
        mockGameEvents().then((events) =>
          events.map((event) => ({
            ...event,
            payload: JSON.stringify(event.payload),
          })),
        ),
    },
  };
}
