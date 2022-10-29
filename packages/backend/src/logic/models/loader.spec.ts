import { describe, expect, it, vi } from 'vitest';
import { mockGameEvents } from '../../util/__mocks__/db';
import { AppEvent } from '../events';
import { Base } from './Base';
import { get } from './loader';

vi.mock('../../util/db');

describe('loader', () => {
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

    const promisedModel = get(ExampleModel, 'id1');
    const model = await get(ExampleModel, 'id1');
    const prevModel = await promisedModel;

    expect(model).toBe(prevModel);
    expect(model).toMatchObject({
      lastEvent: '2000-01-01T10:01Z',
    });
  });
});

class ExampleModel extends Base {
  readonly kind = 'Example';

  constructor(public id: string) {
    super();
  }

  protected applyEvent(event: AppEvent): void {}
}
