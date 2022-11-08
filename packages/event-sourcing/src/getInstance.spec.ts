import { describe, expect, it, vi } from 'vitest';
import { AppEvent } from './AppEvent';
import * as EventStore from './EventStore';
import { getInstance } from './getInstance';
import { Model } from './Model';

const mockGameEvents = vi.fn(async () => [] as AppEvent[]);

EventStore.setupStore({
  getEvents: mockGameEvents,
  storeEvent: vi.fn(),
});

describe('getInstance', () => {
  it('should not apply old events if loader is called multiple times and events are published inbetween', async () => {
    mockGameEvents.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      return [
        {
          type: 'exampleEvent',
          version: 1,
          payload: {},
          createdAt: '2000-01-01T10:00Z',
        } as any,
      ];
    });
    mockGameEvents.mockImplementationOnce(async () => [
      {
        type: 'exampleEvent',
        version: 1,
        payload: {},
        createdAt: '2000-01-01T10:00Z',
      } as any,
      {
        type: 'exampleEvent',
        version: 1,
        payload: {},
        createdAt: '2000-01-01T10:01Z',
      } as any,
    ]);

    const promisedModel = getInstance(ExampleModel, 'id1');
    const model = await getInstance(ExampleModel, 'id1');
    const prevModel = await promisedModel;

    expect(model).toBe(prevModel);
    expect(model).toMatchObject({
      lastEvent: '2000-01-01T10:01Z',
    });
  });
});

class ExampleModel extends Model {
  readonly kind = 'Example';

  constructor(public id: string) {
    super();
  }

  protected applyEvent(event: AppEvent): void {}
}
