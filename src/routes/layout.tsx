import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';
import Header from '~/components/header/header';
import styles from './layout.css?inline';

export default component$(() => {
  useStylesScoped$(styles);
  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});
