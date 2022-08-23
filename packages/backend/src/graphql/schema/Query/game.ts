import { GraphQLYogaError } from '@graphql-yoga/node';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Game {
    id: ID!
    name: String!
    maxPlayers: Int!
    players: [Player!]!
    creator: Player!
    state: GameState!
  }

  enum GameState {
    CREATED
    STARTED
    ENDED
  }

  type Player {
    id: ID!
    # user: User!
  }

  type Query {
    game(id: ID!): Game
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    game: async (_, { id }, { retrieveState, ability }) => {
      if (ability.cannot('read', 'GamesList')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      return (await retrieveState('games')).list.find((g) => g.id === id)!;
    },
  },
};
