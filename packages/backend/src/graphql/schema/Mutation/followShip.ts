import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { issueFollowOrder } from '../../../logic/events';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input FollowShipInput {
    gameId: ID!
    shipId: ID!
    shipToFollowId: ID!
  }

  type Mutation {
    followShip(input: FollowShipInput!): Ship
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    followShip: async (
      _,
      { input: { gameId, shipId, shipToFollowId } },
      { publishEvent, ability, models, userId },
    ) => {
      const ship = await models.Ship.get(shipId);

      if (!ship) {
        throw new GraphQLYogaError('Star system not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('move', ship);

      const shipToFollow = await models.Ship.get(shipToFollowId);

      if (!(await shipToFollow.isVisibleTo(userId))) {
        throw new GraphQLYogaError('Ship to follow not found');
      }

      await publishEvent({
        event: issueFollowOrder({
          gameId,
          subjectId: shipId,
          targetId: shipToFollowId,
        }),
      });

      return await models.Ship.get(shipId);
    },
  },
};
