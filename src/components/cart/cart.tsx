import { component$, useContext, useStyles$ } from "@builder.io/qwik";
import { ShopContext } from "~/components/shop-context/context";
import { formatPrice } from "~/utils/format";
import styles from "./cart.css?inline";
import CartItem from "./cart-item";

export default component$(() => {
  useStyles$(styles);
  const shopState = useContext(ShopContext);
  const count = shopState.order
    ? shopState.order.lines.reduce((memo, line) => memo + line.quantity, 0)
    : 0;

  return (
    <div class="cart">
      <div class="shopping-bag">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="count">{count}</span>
      </div>
      <div class="side-panel">
        {shopState.order?.lines.length ? (
          <div>
            {shopState.order?.lines.map((line) => (
              <CartItem key={line.id} line={line} />
            ))}
            <div class="cart-summary">
              <div class="subtotal">
                <p>Subtotal</p>
                <p>{formatPrice(shopState.order.subTotalWithTax)}</p>
              </div>
              <a href="/checkout" class="cta">Checkout</a>
            </div>
          </div>
        ) : (
          <p>No items in cart</p>
        )}
      </div>
    </div>
  );
});
