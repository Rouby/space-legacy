import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { getInstance } from '@rouby/event-sourcing';
import { constructShip } from '../../../logic/events';
import { ShipDesign, StarSystem } from '../../../logic/models';
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
      { publishEvent, ability, userId },
    ) => {
      const starSystem = await getInstance(StarSystem, systemId);

      if (!starSystem) {
        throw new GraphQLYogaError('Star system not found');
      }

      const shipDesign = await getInstance(ShipDesign, designId);

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

      return (await getInstance(StarSystem, systemId)).shipyards[
        shipyardIndex
      ].shipConstructionQueue.slice(-1)[0];
    },
  },
};
