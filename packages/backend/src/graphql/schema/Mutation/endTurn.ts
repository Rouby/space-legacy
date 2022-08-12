import { GraphQLYogaError } from '@graphql-yoga/node';
import { endTurn } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Mutation {
    endTurn: Boolean!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    endTurn: async (_, __, { publishEvent, ability }) => {
      if (!ability.can('endTurn', 'Game')) {
        throw new GraphQLYogaError('Unauthorized');
      }

      await publishEvent({ event: endTurn() });

      return true;
    },
  },
};
