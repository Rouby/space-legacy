import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { endTurn } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input EndTurnInput {
    gameId: ID!
  }

  type Mutation {
    endTurn(input: EndTurnInput!): Boolean!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    endTurn: async (
      _,
      { input: { gameId } },
      { publishEvent, ability, retrieveState },
    ) => {
      {
        const { list } = await retrieveState('games');
        const game = list.find((d) => d.id === gameId);

        if (!game || ability.cannot('endTurn', subject('Game', game))) {
          throw new GraphQLYogaError('Unauthorized');
        }
      }

      await publishEvent({ event: endTurn() });

      return true;
    },
  },
};
