import { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import { AppEvent } from '../events';
import { type Promised } from './proxies';
import { starSystemProxy } from './proxies/starSystem';
import { userProxy } from './proxies/user';
import type { StarSystem } from './StarSystem';

export class Game {
  static async get(id: string) {
    const game = new Game(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      game.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return game;
  }

  private constructor(public id: string) {}

  public name = '';
  public maxPlayers = 0;
  public creator = userProxy('');
  public state = 'CREATED' as 'CREATED' | 'STARTED' | 'ENDED';
  public round = 0;
  public players = [] as { id: string; turnEnded: boolean }[];
  public starSystems = [] as Promised<StarSystem>[];

  private applyEvent(event: AppEvent) {
    if (event.type === 'createGame' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.maxPlayers = event.payload.maxPlayers;
      this.creator = userProxy(event.payload.creatorId);
      this.round = 1;
    }

    if (event.type === 'joinGame' && event.payload.gameId === this.id) {
      this.players.push({ id: event.payload.userId, turnEnded: false });
    }

    if (event.type === 'startGame' && event.payload.gameId === this.id) {
      this.state = 'STARTED';
    }

    if (event.type === 'endTurn' && event.payload.gameId === this.id) {
      this.players
        .filter((player) => player.id === event.payload.userId)
        .forEach((player) => {
          player.turnEnded = true;
        });
    }

    if (event.type === 'nextRound' && event.payload.gameId === this.id) {
      this.players.forEach((player) => {
        player.turnEnded = false;
      });
      this.round = this.round + 1;
    }

    if (event.type === 'createStarSystem' && event.payload.gameId === this.id) {
      this.starSystems.push(starSystemProxy(event.payload.id));
    }
  }
}
