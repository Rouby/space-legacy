import { subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { musterFleet } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input MusterFleetInput {
    gameId: ID!
    systemId: ID!
    name: String!
    composition: FleetCompositionInput!
  }

  input FleetCompositionInput {
    squadrons: [FleetSquadronInput!]!
  }

  input FleetSquadronInput {
    shipId: ID!
    quantity: Int!
  }

  type Mutation {
    musterFleet(input: MusterFleetInput!): Fleet!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    musterFleet: async (
      _,
      { input: { gameId, systemId, name, composition } },
      { publishEvent, ability, models, userId },
    ) => {
      const game = await models.Game.get(gameId);

      if (!game) {
        throw new GraphQLYogaError('Unauthorized');
      }

      const system = await models.StarSystem.get(systemId);

      console.log(
        system.habitablePlanets[0].owner?.id,
        ability.rulesFor('musterFleet', 'StarSystem'),
        ability.cannot('musterFleet', subject('StarSystem', system)),
      );

      if (
        !system ||
        ability.cannot('musterFleet', system) ||
        ability.cannot('muster', 'Fleet')
      ) {
        throw new GraphQLYogaError('Unauthorized');
      }

      const musterEvent = await publishEvent({
        event: musterFleet({
          gameId,
          userId,
          systemId,
          name,
          coordinates: system.coordinates,
          composition: {
            squadrons: composition.squadrons.map(({ shipId, quantity }) => ({
              shipId,
              quantity,
              workLeft: 100 * quantity,
              materialNeeded: 100 * quantity,
            })),
          },
        }),
      });

      return models.Fleet.get(musterEvent.payload.id);
    },
  },
};
