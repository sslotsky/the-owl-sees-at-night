import { component$, Slot, useContext } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Cart from "~/components/cart/cart";
import { ShopContext } from "~/components/shop-context/context";
import { AUTH_TOKEN_KEY } from "~/graphql/api";

export const useToken = routeLoader$(async (event) => {
  const token = event.cookie.get(AUTH_TOKEN_KEY);
  return token?.value;
})

export default component$(() => {
  const token = useToken();
  const state = useContext(ShopContext);
  if (token.value && !state.token) {
    state.token = `${token.value}`;
  }

  return (
    <>
      <Cart />
      <main>
        {/* Placeholder for wide header */}
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});
