import { AppShell, MantineProvider } from '@mantine/core';
import { SpotlightAction } from '@mantine/spotlight';
import {
  Outlet,
  parseSearchWith,
  ReactLocation,
  Router,
  stringifySearchWith,
} from '@tanstack/react-location';
import { Provider } from 'urql';
import { parse, stringify } from 'zipson';
import { Navigation, Spotlight } from './components';
import { useClient } from './graphql';
import { CombatView, Dashboard, StarSystemView } from './pages';

const reactLocation = new ReactLocation({
  parseSearch: parseSearchWith((value) =>
    parse(decodeURIComponent(atob(value))),
  ),
  stringifySearch: stringifySearchWith((value) =>
    btoa(encodeURIComponent(stringify(value))),
  ),
});

const actions: SpotlightAction[] = [];

export default function App() {
  const client = useClient();
  return (
    <Provider value={client}>
      <Router
        location={reactLocation}
        routes={[
          { path: '/', element: <Dashboard /> },
          {
            path: 'star-system/:starSystemId',
            element: <StarSystemView />,
          },
          {
            path: 'combat/:combatId',
            element: <CombatView />,
          },
        ]}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme: 'dark' }}
        >
          <Spotlight>
            <AppShell navbar={<Navigation />}>
              <Outlet />
            </AppShell>
          </Spotlight>
        </MantineProvider>
      </Router>
    </Provider>
  );
}
