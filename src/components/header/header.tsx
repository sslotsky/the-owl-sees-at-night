import { component$, useStylesScoped$, useSignal } from '@builder.io/qwik';
import styles from './header.css?inline';

export default component$(() => {
  useStylesScoped$(styles);
  const open = useSignal(false);

  return (
    <header>
      <div class="logo">
        <h1>Bee Wednesday <strong>photography for humans</strong></h1>
      </div>
      <ul class="left-nav">
        <li>
          <a href="/photos">
            Latest Shots
          </a>
        </li>
      </ul>
      <div class="top-nav">
        <button onClick$={() => open.value = !open.value} class="menu">&#8801;</button>
          {open.value && (
            <ul>
              <li>
                <a href="/photos">
                  Latest Shots
                </a>
              </li>
            </ul>
          )}
      </div>
    </header>
  );
});
