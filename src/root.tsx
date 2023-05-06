import { component$, useServerData } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';
import { ShopProvider } from './components/shop-context/context';

import './global.css';
import { parse } from 'cookie';
import { AUTH_TOKEN_KEY } from './graphql/api';

export default component$(() => {
  const headers = useServerData<Record<string, string>>("requestHeaders");
  const cookies = headers?.cookie || "";
  const token = parse(cookies)[AUTH_TOKEN_KEY];
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */

  return (
    <ShopProvider token={token}>
      <QwikCityProvider>
        <head>
          <meta charSet="utf-8" />
          <link rel="manifest" href="/manifest.json" />
          <link
            href="https://fonts.googleapis.com/css2?family=Hind+Guntur&family=Hind+Siliguri&family=Mako&display=swap"
            rel="stylesheet"
          />
          <script src="https://js.stripe.com/v3/"></script>
          <RouterHead />
        </head>
        <body lang="en">
          <RouterOutlet />
          <ServiceWorkerRegister />
        </body>
      </QwikCityProvider>
    </ShopProvider>
  );
});
