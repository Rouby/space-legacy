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

          ... on FTLShipComponent {
            ftlSpeed
            fuelConsumption
          }

          ... on GeneratorShipComponent {
            powerGeneration
          }

          ... on AugmentationShipComponent {
            lifeSupport
            crewCapacity
            soldierCapacity
          }
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
        
        ... on FTLShipComponent {
          ftlSpeed
          fuelConsumption
        }

        ... on GeneratorShipComponent {
          powerGeneration
        }

        ... on AugmentationShipComponent {
          lifeSupport
          crewCapacity
          soldierCapacity
        }
      }
    } 
  `;
  const [availableShipComponents] = useAvailableShipComponentsQuery({
    variables: { gameId: game?.id! },
  });

  const [newComponents, setNewComponents] = useState<
    AvailableShipComponentsQuery['shipComponents']
  >([]);

  const powerDraw = (shipDesign.data?.shipDesign?.components ?? newComponents)
    .map((comp) => comp.powerDraw)
    .reduce((a, b) => a + b, 0);
  const powerGeneration = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) =>
      comp.__typename === 'GeneratorShipComponent' ? comp.powerGeneration : 0,
    )
    .reduce((a, b) => a + b, 0);

  const crewRequirements = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) => comp.crewRequirements)
    .reduce((a, b) => a + b, 0);
  const crewCapacity = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) =>
      comp.__typename === 'AugmentationShipComponent'
        ? comp.crewCapacity ?? 0
        : 0,
    )
    .reduce((a, b) => a + b, 0);

  const lifeSupportRequired = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map(
      (comp) =>
        comp.crewRequirements +
        (comp.__typename === 'AugmentationShipComponent'
          ? comp.soldierCapacity ?? 0
          : 0),
    )
    .reduce((a, b) => a + b, 0);
  const lifeSupportProvided = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) =>
      comp.__typename === 'AugmentationShipComponent'
        ? comp.lifeSupport ?? 0
        : 0,
    )
    .reduce((a, b) => a + b, 0);

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
      <Paper withBorder p="md" radius="md">
        <Progress
          sections={[
            {
              color: 'green',
              value: Math.max(0, crewCapacity - crewRequirements),
            },
            {
              color: 'red',
              value: Math.max(0, crewRequirements - crewCapacity),
            },
          ]}
        />
      </Paper>
      <Paper withBorder p="md" radius="md">
        <Progress
          sections={[
            {
              color: 'green',
              value: Math.max(0, lifeSupportProvided - lifeSupportRequired),
            },
            {
              color: 'red',
              value: Math.max(0, lifeSupportRequired - lifeSupportProvided),
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
