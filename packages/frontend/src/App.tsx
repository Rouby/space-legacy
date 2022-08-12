import {
  AppShell,
  Box,
  Group,
  MantineProvider,
  Navbar,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconDatabase } from '@tabler/icons';
import {
  Link,
  Outlet,
  parseSearchWith,
  ReactLocation,
  Router,
  stringifySearchWith,
} from '@tanstack/react-location';
import { Provider } from 'urql';
import { parse, stringify } from 'zipson';
import { UserInfo } from './components';
import { client } from './graphql';
import { Dashboard } from './pages';

const reactLocation = new ReactLocation({
  parseSearch: parseSearchWith((value) =>
    parse(decodeURIComponent(atob(value))),
  ),
  stringifySearch: stringifySearchWith((value) =>
    btoa(encodeURIComponent(stringify(value))),
  ),
});

export default function App() {
  return (
    <Provider value={client}>
      <Router
        location={reactLocation}
        routes={[{ path: '/', element: <Dashboard /> }]}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme: 'dark' }}
        >
          <AppShell
            navbar={
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

                        <Text size="sm">Home</Text>
                      </Group>
                    </UnstyledButton>
                  </Box>
                </Navbar.Section>
                <Navbar.Section>
                  <UserInfo />
                </Navbar.Section>
              </Navbar>
            }
          >
            <Outlet />
          </AppShell>
        </MantineProvider>
      </Router>
    </Provider>
  );
}
