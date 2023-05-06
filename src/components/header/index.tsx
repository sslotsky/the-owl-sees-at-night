import { component$, useStyles$ } from "@builder.io/qwik";
import styles from './header.css?inline'

export default component$(() => {
  useStyles$(styles);
  return (
    <>
      <header>
        <h1><a href="/">Bee Wednesday</a></h1>
      </header>
    </>
  );
});