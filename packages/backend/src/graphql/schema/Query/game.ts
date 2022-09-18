import { ForbiddenError } from '@casl/ability';
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

  type Player {
    id: ID!
    turnEnded: Boolean!
  }

  type Query {
    game(id: ID!): Game
  }
`;

export const resolvers: Resolvers = {
  Query: {
    game: async (_, { id }, { ability, models }) => {
      ForbiddenError.from(ability).throwUnlessCan('read', 'GamesList');

      return models.Game.get(id);
    },
  },
};
