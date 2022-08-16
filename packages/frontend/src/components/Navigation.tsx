import {
  Box,
  Group,
  Navbar,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconDatabase } from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import { useAbility } from '../utility';
import { UserInfo } from './UserInfo';

export function Navigation() {
  const ability = useAbility();
  const isSignedIn = ability.can('read', 'User');

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
          <UnstyledButton
            sx={(theme) => ({
              display: 'block',
              width: '100%',
              padding: theme.spacing.xs,
              borderRadius: theme.radius.sm,
              color:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[0]
                  : theme.black,

              '&:hover': {
                backgroundColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
            })}
            component={Link}
            to="/"
          >
            <Group>
              <ThemeIcon variant="light">
                <IconDatabase />
              </ThemeIcon>

              <Text size="sm">Dashboard</Text>
            </Group>
          </UnstyledButton>
        </Box>
      </Navbar.Section>
      <Navbar.Section>
        <UserInfo />
      </Navbar.Section>
    </Navbar>
  );
}
