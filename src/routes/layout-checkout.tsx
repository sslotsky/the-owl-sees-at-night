import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import Flash from "~/components/flash";
import styles from "./checkout.css?inline";

export default component$(() => {
  useStyles$(styles);
  const location = useLocation();
  return (
    <>
      <Flash />
      <main>
        <nav>
          <ol>
            <li>
              <span class="checkout-crumbs" data-active={location.pathname === '/checkout/'}>Shipping</span>
            </li>
            <li>
              <span class="checkout-crumbs" data-active={location.pathname === '/checkout/payment/'}>Payment</span>
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
