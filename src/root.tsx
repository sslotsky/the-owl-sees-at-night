import { component$, useStyles$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import globalStyles from './global.css?inline';
import { ShopProvider } from './components/shop-context/context';
import Cart from './components/cart/cart';
import { cache } from '~/gql/api'

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  cache.clear();
  useStyles$(globalStyles);

  return (
    <ShopProvider>
      <QwikCityProvider>
        <head>
          <meta charSet="utf-8" />
          <link rel="manifest" href="/manifest.json" />
          <link href="https://fonts.googleapis.com/css2?family=Hind+Guntur&family=Hind+Siliguri&family=Mako&display=swap" rel="stylesheet" />
          <RouterHead />
        </head>
        <body lang="en">
          <Cart />
          <RouterOutlet />
          <ServiceWorkerRegister />
        </body>
      </QwikCityProvider>
    </ShopProvider>
  );
});
