import { component$, useStylesScoped$, useSignal } from "@builder.io/qwik";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const open = useSignal(false);

  const classes = ["top-nav"];
  if (open.value) {
    classes.push("open");
  }

  return (
    <header>
      <div class="logo">
        <h1>
          Bee Wednesday <strong>photography for humans</strong>
        </h1>
      </div>
      <ul class="left-nav">
        <li>
          <a href="/">Latest Shots</a>
        </li>
      </ul>
      <div class={classes.join(" ")}>
        <button onClick$={() => (open.value = !open.value)} class="menu">
          &#8801;
        </button>
        <ul>
          <li>
            <a href="/">Latest Shots</a>
          </li>
        </ul>
      </div>
    </header>
  );
});
