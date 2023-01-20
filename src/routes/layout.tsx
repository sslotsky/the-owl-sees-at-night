import { component$, Slot, useStyles$ } from '@builder.io/qwik';
import Header from '~/components/header/header';
import styles from './layout.css?inline';

export default component$(() => {
  useStyles$(styles);
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
