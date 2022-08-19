import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { startGame } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Game {
    id: ID!
    state: GameState!
  }

  enum GameState {
    CREATED
    STARTED
    ENDED
  }

  input StartGameInput {
    id: ID!
  }

  type Mutation {
    startGame(input: StartGameInput!): Game!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    startGame: async (
      _,
      { input: { id } },
      { publishEvent, retrieveState, ability },
    ) => {
      {
        const { list } = await retrieveState('games');
        const game = list.find((d) => d.id === id);

        if (!game || ability.cannot('start', subject('Game', game))) {
          throw new GraphQLYogaError('Unauthorized');
        }
      }

      await publishEvent({
        event: startGame({
          gameId: id,
        }),
      });

      const { list } = await retrieveState('games');

      return list.find((d) => d.id === id)!;
    },
  },
};
