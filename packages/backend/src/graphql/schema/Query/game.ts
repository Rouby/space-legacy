import { ForbiddenError } from '@casl/ability';
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
    game: async (_, { id }, { ability, get }) => {
      ForbiddenError.from(ability).throwUnlessCan('read', 'GamesList');

      return get(Game, id);
    },
  },
};
