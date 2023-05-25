import { component$, useSignal, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { useGetOrderByCode } from "~/components/shop-context/context";
import { graphqlRequestHandler } from "~/graphql/api";
import styles from './confirmation.css?inline';
import cartStyles from '~/components/cart/cart.css?inline';
import CartItem from "~/components/cart/cart-item";
import { formatPrice } from "~/utils/format";
import { orderByCodeQuery } from "~/components/shop-context/queries";
import type { GetOrderByCodeQuery } from "~/generated/graphql";

export const useOrder = routeLoader$(async (event) => {
  const code = event.params.code;
  const handler = graphqlRequestHandler(event);
  const result =  await handler<GetOrderByCodeQuery>(orderByCodeQuery, { code });
  if (result.kind === 'error') {
    return { orderByCode: undefined };
  }

  return result.data;
});

export default component$(() => {
  useStyles$(styles);
  useStyles$(cartStyles);
  const initialOrderResponse = useOrder();
  const orderResponse = useSignal(initialOrderResponse.value);
  const attempts = useSignal(0);
  const loc = useLocation();
  const code = loc.params.code;
  const refreshOrder$ = useGetOrderByCode(code);

  useVisibleTask$(({ track }) => {
    track(() => attempts.value);

    if (orderResponse.value.orderByCode?.state !== 'PaymentSettled') {
      if (attempts.value > 5) {
        return;
      }

      setTimeout(async () => {
        try {
          orderResponse.value = await refreshOrder$();
        } catch (e) { /* empty */ }
        attempts.value = attempts.value + 1;
      }, 2000);
    }
  });

  if (!orderResponse.value.orderByCode) {
    if (attempts.value > 5) {
      return (
        <>
          Unable to retrieve order {code}
        </>
      )
    }

    return (
      <>
        <h2>Hang on a moment...</h2>
      </>
    )
  }

  const order = orderResponse.value.orderByCode;
  if (order.state === 'PaymentSettled') {
    return (
      <div class="center-column">
        <h2 class="flex-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-green w-1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Order Summary
        </h2>
        <h3>Your order <b>{order.code}</b> has been received!</h3>

        <div>
          {order.lines.map((line) => (
            <CartItem key={line.id} line={line} editable={false} />
          ))}
          <div class="cart-summary ledger-top">
            <div class="subtotal">
              <p>Subtotal</p>
              <p>{formatPrice(order.subTotalWithTax)}</p>
            </div>
            <div class="subtotal">
              <p>Shipping</p>
              <p>{formatPrice(order.shippingWithTax)}</p>
            </div>
            <div class="subtotal ledger-top">
              <p>Total</p>
              <p>{formatPrice(order.totalWithTax)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <h2>{order.code} {order.state}</h2>
    </>
  )
});