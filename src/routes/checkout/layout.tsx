import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import Flash from "~/components/flash";
import styles from "./checkout.css?inline";
import cartStyles from '~/components/cart/cart.css?inline';

export default component$(() => {
  useStyles$(styles);
  useStyles$(cartStyles);
  const location = useLocation();

  return (
    <>
      <Flash />
      <main>
        <nav>
          <ol>
            <li>
              <span class="checkout-crumbs" data-active={location.url.pathname === '/checkout/'}>Shipping</span>
            </li>
            <li>
              <span class="checkout-crumbs" data-active={location.url.pathname === '/checkout/payment/'}>Payment</span>
            </li>
            <li>
              <span class="checkout-crumbs" data-active={location.url.pathname.includes('/checkout/confirmation/')}>Confirmation</span>
            </li>
          </ol>
        </nav>
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});
