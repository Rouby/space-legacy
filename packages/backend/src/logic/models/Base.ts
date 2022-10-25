import type { GameEvent } from '@prisma/client';
import { logger } from '../../logger';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';

export abstract class Base {
  abstract get kind(): string;

  static async applyEvents(instance: Base) {
    const lastEvent = instance.lastEvent;
    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      where: { createdAt: { gt: instance.lastEvent } },
      orderBy: { createdAt: 'asc' },
    });
    if (lastEvent !== instance.lastEvent) {
      logger.trace('Concurrent request detected, ignoring events');
      return instance;
    }

    logger.trace(
      'Applying %d events to %s since %s',
      events.length,
      instance.kind,
      instance.lastEvent ?? 'beginning of time',
    );

    events.forEach((event) => {
      instance.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    if (events.length > 0) {
      instance.lastEvent = events.at(-1)?.createdAt;
    }

    return instance;
  }

  private lastEvent?: Date;

  protected abstract applyEvent(event: AppEvent): void;
}
