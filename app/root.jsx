import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import { Theme } from '@radix-ui/themes';
import { cssBundleHref } from "@remix-run/css-bundle";
import radixStyles from '@radix-ui/themes/styles.css';
import global from './global.css';
import { themePreference, authorize } from "./sessions.server.js";
import { json } from "@remix-run/node";
import * as Toast from '@radix-ui/react-toast';
import env from "./environment.server.js";
import WebsocketContext from "./components/websocket-context.jsx";
import useWebSocket from 'react-use-websocket';
import { useLocation } from "@remix-run/react";

export const links = () => [
  { rel: "stylesheet", href: radixStyles },
  { rel: "stylesheet", href: global },
  !!cssBundleHref ? { rel: "stylesheet", href: cssBundleHref } : {},
];

export const loader = async ({ request }) => {
  const jwt = await authorize(request);
  const theme = await themePreference(request);

  return json({
    theme: theme,
    wsUrl: `${env.wsUrl}?token=${encodeURIComponent(jwt)}`,
    authorized: !!jwt,
  });
}

function App() {
  const data = useLoaderData();

  const location = useLocation();

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(data.wsUrl, {
    heartbeat: true,
    onOpen: () => {
      console.log("Connection established");
    },
    onError: () => {
      console.log("Connection has an error");
    },
    onClose: () => {
      console.log("Connection closed");
    },
    onMessage: (e) => {

    },
  }, data.authorized);

  return (
    <html lang="en" className={data.theme} style={{ colorScheme: data.theme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="darkreader-lock" />
        <link rel="canonical" href={`https://www.wikid.app${location.pathname}`}/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-icon-512x512.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme grayColor="gray" panelBackground="translucent" scaling="100%" accentColor="blue">
          <Toast.Provider swipeDirection="right">
            <WebsocketContext.Provider value={{ sendJsonMessage: sendJsonMessage, lastJsonMessage: lastJsonMessage }}>
              <Outlet />
              <ScrollRestoration />
              <Scripts />
              <LiveReload />
            </WebsocketContext.Provider>
          </Toast.Provider>
        </Theme>
      </body>
    </html>
  );
}

export default App;
