import { component$, Slot } from "@builder.io/qwik";
import Cart from "~/components/cart/cart";

export default component$(() => {
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
