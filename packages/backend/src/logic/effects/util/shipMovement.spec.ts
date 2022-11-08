import { EventStore, getInstance } from '@rouby/event-sourcing';
import { describe, expect, it, vi } from 'vitest';
import { issueFollowOrder, issueMoveOrder, launchShip } from '../../events';
import '../../index';
import { Ship } from '../../models';
import { moveShips } from './shipMovement';

const mockGameEvents = vi.fn(async () => [] as any[]);

EventStore.setupStore({
  getEvents: mockGameEvents,
  storeEvent: vi.fn(),
});

describe('shipMovement', () => {
  it('should schedule a movement for a ship with an order', async () => {
    mockGameEvents.mockImplementation(async () => [
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
      [await getInstance(Ship, '1')],
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

  it('should stop movement for hostile crossing ships', async () => {
    mockGameEvents.mockImplementation(async () => [
      launchShip({
        id: '1',
        gameId: '',
        designId: '',
        userId: '',
        coordinates: { x: 5, y: 0 },
      }),
      issueMoveOrder({
        gameId: '',
        subjectId: '1',
        to: { x: -5, y: 10 },
      }),

      launchShip({
        id: '2',
        gameId: '',
        designId: '',
        userId: '',
        coordinates: { x: -5, y: 0 },
      }),
      issueMoveOrder({
        gameId: '',
        subjectId: '2',
        to: { x: 5, y: 10 },
      }),
    ]);

    const scheduleEvent = vi.fn();

    await moveShips(
      [await getInstance(Ship, '1'), await getInstance(Ship, '2')],
      { payload: { gameId: '', userId: '' } } as any,
      scheduleEvent,
    );

    expect(scheduleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'moveShip',
        version: 1,
        payload: { gameId: '', shipId: '1', to: { x: 0, y: 5 } },
      }),
    );
    expect(scheduleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'moveShip',
        version: 1,
        payload: { gameId: '', shipId: '2', to: { x: 0, y: 5 } },
      }),
    );
  });

  it('should move ships that follow each other straight at each other', async () => {
    mockGameEvents.mockImplementation(async () => [
      launchShip({
        id: '1',
        gameId: '',
        designId: '',
        userId: '',
        coordinates: { x: 5, y: 0 },
      }),
      issueFollowOrder({
        gameId: '',
        subjectId: '1',
        targetId: '2',
        usePredictiveRoute: true,
      }),

      launchShip({
        id: '2',
        gameId: '',
        designId: '',
        userId: '',
        coordinates: { x: -5, y: 0 },
      }),
      issueFollowOrder({
        gameId: '',
        subjectId: '2',
        targetId: '1',
        usePredictiveRoute: true,
      }),
    ]);

    const scheduleEvent = vi.fn();

    await moveShips(
      [await getInstance(Ship, '1'), await getInstance(Ship, '2')],
      { payload: { gameId: '', userId: '' } } as any,
      scheduleEvent,
    );

    expect(scheduleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'moveShip',
        version: 1,
        payload: { gameId: '', shipId: '1', to: { x: 0, y: 0 } },
      }),
    );
    expect(scheduleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'moveShip',
        version: 1,
        payload: { gameId: '', shipId: '2', to: { x: 0, y: 0 } },
      }),
    );
  });
});
