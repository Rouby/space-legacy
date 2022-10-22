import { ForbiddenError } from '@casl/ability';
import { Player, ShipDesign } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type ShipDesign {
    id: ID!
    name: String!
    structuralHealth: Int!
    owner: Player!
    components: [ShipComponent!]!
  }

  type Query {
    shipDesign(id: ID!, gameId: ID!): ShipDesign
    shipDesigns(gameId: ID!): [ShipDesign!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    shipDesign: async (_, { gameId, id }, { get, ability, userId }) => {
      const shipDesign = await get(ShipDesign, id);

      ForbiddenError.from(ability).throwUnlessCan('read', shipDesign);

      return shipDesign;
    },
    shipDesigns: async (_, { gameId }, { get, userId }) => {
      const designs = (await get(Player, gameId, userId)).availableShipDesigns;

      return designs;
    },
  },
};
