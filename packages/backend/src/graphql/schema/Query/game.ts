import { ForbiddenError } from '@casl/ability';
import { getInstance } from '@rouby/event-sourcing';
import { GraphQLError } from 'graphql';
import { Game } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Game {
    id: ID!
    name: String!
    maxPlayers: Int!
    players: [Player!]!
    creator: User!
    state: GameState!
    round: Int!
  }

  enum GameState {
    NON_EXISTENT
    CREATED
    STARTED
    ENDED
  }

  type Query {
    game(id: ID!): Game
  }
`;

export const resolvers: Resolvers = {
  Query: {
    game: async (_, { id }, { ability }) => {
      ForbiddenError.from(ability).throwUnlessCan('read', 'GamesList');

      const game = await getInstance(Game, id);

      if (game.state === 'NON_EXISTENT') {
        throw new GraphQLError('Game does not exist');
      }

      return game;
    },
  },
};
