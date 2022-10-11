import { describe, expect, it, vi } from 'vitest';
import { mockGameEvents } from '../../../util/__mocks__/db';
import { issueMoveOrder, launchShip } from '../../events';
import '../../index';
import { Ship } from '../../models';
import { moveShips } from './shipMovement';

vi.mock('../../../util/db');

describe('shipMovement', () => {
  it('should schedule a movement for a ship with an order', async () => {
    mockGameEvents.mockImplementation(() => [
      launchShip({
        id: '1',
        gameId: '',
        designId: '',
        userId: '',
        coordinates: { x: 0, y: 0 },
      }),
      issueMoveOrder({
        gameId: '',
        subjectId: '1',
        to: { x: 20, y: 0 },
      }),
    ]);

    const scheduleEvent = vi.fn();

    await moveShips(
      [await Ship.get('1')],
      { payload: { gameId: '', userId: '' } } as any,
      scheduleEvent,
    );

    expect(scheduleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'moveShip',
        version: 1,
        payload: { gameId: '', shipId: '1', to: { x: 10, y: 0 } },
      }),
    );
  });
});
