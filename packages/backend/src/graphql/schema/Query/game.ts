import { GraphQLYogaError } from '@graphql-yoga/node';
import { context } from '../../context';
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

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    game: async (_, { id }, { ability, models }) => {
      if (ability.cannot('read', 'GamesList')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      return models.Game.get(id);
    },
  },
};
