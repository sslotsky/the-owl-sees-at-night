import { component$, useContext, useStyles$ } from "@builder.io/qwik";
import { ShopContext } from "~/components/shop-context/context";
import styles from "./flash.css?inline";

export default component$(() => {
  useStyles$(styles);
  const ctx = useContext(ShopContext);
  return (
    <div class="flash-container">
      {ctx.flash.error && (
        <div class="flash error">
          <p>{ctx.flash.error}</p>
          <button onClick$={() => { ctx.flash.error = undefined; }} class="dismiss">x</button>
        </div>
      )}
    </div>
  );
});

