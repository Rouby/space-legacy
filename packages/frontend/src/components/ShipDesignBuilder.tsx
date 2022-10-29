import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Paper,
  Progress,
  Text,
} from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons';
import { useMatch } from '@tanstack/react-location';
import { useState } from 'react';
import {
  AvailableShipComponentsQuery,
  useAvailableShipComponentsQuery,
  useShipDesignDetailsQuery,
} from '../graphql';
import { useGame } from '../utility';

export function ShipDesignBuilder() {
  const {
    params: { id },
  } = useMatch();
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query shipDesignDetails($gameId: ID!, $shipDesignId: ID!) {
      shipDesign(gameId: $gameId, id: $shipDesignId) {
        __typename
        id
        name
        owner {
          id
          userId
        }
        components {
          id
          name
          powerDraw
          crewRequirements
          structuralStrength
          resourceCosts
        }
      }
    } 
  `;
  const [shipDesign] = useShipDesignDetailsQuery({
    variables: { gameId: game?.id!, shipDesignId: id! },
    pause: !id,
  });

  /* GraphQL */ `#graphql
    query availableShipComponents($gameId: ID!) {
      shipComponents(gameId: $gameId) {
        __typename
        id
        name
        powerDraw
        crewRequirements
        structuralStrength
        resourceCosts
      }
    } 
  `;
  const [availableShipComponents] = useAvailableShipComponentsQuery({
    variables: { gameId: game?.id! },
  });

  const [newComponents, setNewComponents] = useState<
    AvailableShipComponentsQuery['shipComponents']
  >([]);

  const powerDraw = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  ).reduce((acc, comp) => acc + comp.powerDraw, 0);
  const powerGeneration = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  ).reduce((acc, comp) => acc, 0);

  return (
    <>
      build me up {id} {availableShipComponents.data?.shipComponents.length}
      {availableShipComponents.data?.shipComponents.map((component) => (
        <Group key={component.id}>
          <ActionIcon
            onClick={() =>
              setNewComponents((components) => [...components, component])
            }
          >
            <IconPlus />
          </ActionIcon>
          <Avatar />
          <Box>
            <Text>{component.name}</Text>
          </Box>
        </Group>
      ))}
      <Paper withBorder p="md" radius="md">
        <Progress
          sections={[
            {
              color: 'green',
              value: Math.max(0, powerGeneration - powerDraw),
            },
            {
              color: 'red',
              value: Math.max(0, powerDraw - powerGeneration),
            },
          ]}
        />
      </Paper>
      Components:
      {(shipDesign.data?.shipDesign?.components ?? newComponents).map(
        (component, idx) => (
          <Group key={component.id}>
            {!shipDesign.data?.shipDesign?.components && (
              <ActionIcon
                onClick={() =>
                  setNewComponents(
                    newComponents.filter((_, idx2) => idx !== idx2),
                  )
                }
              >
                <IconMinus />
              </ActionIcon>
            )}
            <Avatar />
            <Box>
              <Text>{component.name}</Text>
            </Box>
          </Group>
        ),
      )}
    </>
  );
}
