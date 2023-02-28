import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import styles from "./checkout.css?inline";

export default component$(() => {
  useStyles$(styles);
  return (
    <>
      <main>
        <nav>
          <ol>
            <li>
              <span>Shipping</span>
            </li>
            <li>
              <span>Payment</span>
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
