import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { constructShip } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input ConstructShipInput {
    gameId: ID!
    systemId: ID!
    shipyardIndex: Int!
    shipId: ID!
  }

  type Mutation {
    constructShip(input: ConstructShipInput!): ShipConstruction
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    constructShip: async (
      _,
      { input: { gameId, systemId, shipyardIndex, shipId } },
      { publishEvent, ability, models, userId },
    ) => {
      const starSystem = await models.StarSystem.get(systemId);

      if (
        !starSystem ||
        ability.cannot('constructShip', subject('StarSystem', starSystem))
      ) {
        throw new GraphQLYogaError('Unauthorized');
      }

      await publishEvent({
        event: constructShip({
          gameId,
          systemId,
          userId,
          shipyardIndex,
          shipId,
          workNeeded: 100,
          materialsNeeded: 100,
        }),
      });

      return (await models.StarSystem.get(systemId)).shipyards[
        shipyardIndex
      ].shipConstructionQueue.slice(-1)[0];
    },
  },
};
