import { component$, Slot, useContext, useStyles$ } from "@builder.io/qwik";
import CartItem from "~/components/cart/cart-item";
import { ShopContext } from "~/components/shop-context/context";
import { formatPrice } from "~/utils/format";
import styles from "./checkout.css?inline";
import cartStyles from '~/components/cart/cart.css?inline';

export default component$(() => {
  useStyles$(styles);
  useStyles$(cartStyles);
  const ctx = useContext(ShopContext);

  return (
    <>
      <div class="checkout-container">
        <div>
          <Slot />
        </div>
        <div>
          <h2>Order Summary</h2>
          {ctx.order?.lines.map((line) => (
            <CartItem key={line.id} line={line} editable={ctx.order?.state === "AddingItems"} />
          ))}
          <div class="cart-summary">
            <div class="subtotal">
              <p>Subtotal</p>
              <p>{ctx.order && formatPrice(ctx.order.subTotalWithTax)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

