import { vi } from 'vitest';
import type { AppEvent } from '../../logic/events';

export const mockGameEvents = vi.fn(() => [] as AppEvent[]);

export function getDbClient() {
  return {
    gameEvent: {
      findMany: () =>
        mockGameEvents().map((event) => ({
          ...event,
          payload: JSON.stringify(event.payload),
        })),
    },
  };
}
