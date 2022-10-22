import {
  Box,
  Group,
  Navbar,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconAbacus, IconDatabase, IconHammer } from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import { useAbility, useGame } from '../utility';
import { UserInfo } from './UserInfo';

export function Navigation() {
  const ability = useAbility();
  const [game] = useGame();
  const isSignedIn = ability.can('read', 'User');
  const isInGame = !!game;

  return (
    <Navbar p="xs" width={{ base: 300 }}>
      <Navbar.Section mt="xs">
        <Box
          sx={(theme) => ({
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            paddingBottom: theme.spacing.lg,
            borderBottom: `1px solid ${
              theme.colorScheme === 'dark'
                ? theme.colors.dark[4]
                : theme.colors.gray[2]
            }`,
          })}
        >
          <Group position="apart">Space</Group>
        </Box>
      </Navbar.Section>
      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
        <Box py="md">
          <NavButton icon={<IconDatabase />} to="/">
            Dashboard
          </NavButton>
          {isInGame && (
            <NavButton icon={<IconHammer />} to="/ship-designs">
              Ship Designs
            </NavButton>
          )}
          {isInGame && (
            <NavButton icon={<IconAbacus />} to="/research">
              Research
            </NavButton>
          )}
        </Box>
      </Navbar.Section>
      <Navbar.Section>
        <UserInfo />
      </Navbar.Section>
    </Navbar>
  );
}

function NavButton({
  icon,
  to,
  children,
}: {
  icon: React.ReactNode;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <UnstyledButton
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      })}
      component={Link}
      to={to}
    >
      <Group>
        <ThemeIcon variant="light">{icon}</ThemeIcon>

        <Text size="sm">{children}</Text>
      </Group>
    </UnstyledButton>
  );
}
