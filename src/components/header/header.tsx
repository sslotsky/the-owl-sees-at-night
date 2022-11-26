import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './header.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <div class="logo">
        <h1>Bee Wednesday <strong>photography</strong></h1>
      </div>
      <ul>
        <li>
          <a href="/">
            Latest Shots
          </a>
        </li>
      </ul>
    </header>
  );
});
