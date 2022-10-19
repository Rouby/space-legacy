import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { constructShip } from '../../../logic/events';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input ConstructShipInput {
    gameId: ID!
    systemId: ID!
    shipyardIndex: Int!
    designId: ID!
  }

  type Mutation {
    constructShip(input: ConstructShipInput!): ShipConstruction
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    constructShip: async (
      _,
      { input: { gameId, systemId, shipyardIndex, designId } },
      { publishEvent, ability, models, userId },
    ) => {
      const starSystem = await models.StarSystem.get(systemId);

      if (!starSystem) {
        throw new GraphQLYogaError('Star system not found');
      }

      const shipDesign = await models.ShipDesign.get(designId);

      if (!shipDesign) {
        throw new GraphQLYogaError('Ship design not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('constructShip', starSystem);
      ForbiddenError.from(ability).throwUnlessCan('construct', shipDesign);

      await publishEvent({
        event: constructShip({
          gameId,
          systemId,
          userId,
          shipyardIndex,
          designId,
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
