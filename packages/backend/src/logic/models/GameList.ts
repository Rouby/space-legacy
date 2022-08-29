import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { proxies } from './proxies';

export class GameList {
  static get modelName() {
    return 'GameList';
  }

  static async get() {
    const gameList = new GameList();

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      gameList.#applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return gameList;
  }

  private constructor() {}

  public list = [] as ReturnType<typeof proxies.gameProxy>[];

  #applyEvent(event: AppEvent) {
    if (event.type === 'createGame') {
      this.list.push(proxies.gameProxy(event.payload.id));
    }

    if (event.type === 'deleteGame') {
      const idx = this.list.findIndex((game) => game.id === event.payload.id);
      if (idx >= 0) {
        this.list.splice(idx, 1);
      }
    }
  }
}
