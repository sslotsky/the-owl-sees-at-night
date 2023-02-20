import { component$, Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <>
      <main>
        {/* Placeholder for wide header */}
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});
