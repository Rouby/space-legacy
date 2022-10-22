import { AppShell, MantineProvider } from '@mantine/core';
import {
  Outlet,
  parseSearchWith,
  ReactLocation,
  Router,
  stringifySearchWith,
} from '@tanstack/react-location';
import { Provider } from 'urql';
import { parse, stringify } from 'zipson';
import { Navigation, ShipDesignBuilder, Spotlight } from './components';
import { useClient } from './graphql';
import {
  CombatView,
  Dashboard,
  Research,
  ShipDesigns,
  StarSystemView,
} from './pages';

const reactLocation = new ReactLocation({
  parseSearch: parseSearchWith((value) =>
    parse(decodeURIComponent(atob(value))),
  ),
  stringifySearch: stringifySearchWith((value) =>
    btoa(encodeURIComponent(stringify(value))),
  ),
});

export default function App() {
  const client = useClient();
  return (
    <Provider value={client}>
      <Router
        location={reactLocation}
        routes={[
          { path: '/', element: <Dashboard /> },
          {
            path: 'ship-designs',
            element: <ShipDesigns />,
            children: [
              {
                path: 'new',
                element: <ShipDesignBuilder />,
              },
              {
                path: ':id',
                element: <ShipDesignBuilder />,
              },
            ],
          },
          {
            path: 'research',
            element: <Research />,
          },
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
