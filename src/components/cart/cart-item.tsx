import { component$, useSignal, $ } from "@builder.io/qwik";
import { ActiveOrderQuery } from "~/gql/graphql";
import { removeOrderLine, changeQuantity } from "../shop-context/context";
import { Unarray } from "~/routes/custom-prints/types";

export function formatPrice(cents: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(cents / 100);
}

type OrderLine = Unarray<NonNullable<ActiveOrderQuery["activeOrder"]>["lines"]>;

export default component$((props: { line: OrderLine }) => {
  const { line } = props;
  const loading = useSignal(false);
  const remove$ = removeOrderLine(line.id);
  const addOne$ = changeQuantity(line.id, line.quantity + 1);
  const update$ = $(async (f$: () => Promise<any>) => {
    loading.value = true;
    const result = await f$();
    loading.value = false;
    return result;
  });
  // const removeOne$ = changeQuantity(line.id, line.quantity - 1);
  return (
    <div class="cart-item">
      <img src={line.previewUrl} />
      <div class="product-text">
        <span>{line.productVariant.name}</span>
        <span>
          {line.quantity}x @ {formatPrice(line.productVariant.price)}
        </span>
        <span>{formatPrice(line.linePriceWithTax)}</span>
        <div class="cart-item-actions">
          <button
            class="cart-item-action warning"
            disabled={loading.value}
            onClick$={async () => {
              if (confirm("Remove this item from your cart?")) {
                return update$(remove$);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
          <button
            class="cart-item-action"
            disabled={loading.value}
            onClick$={async () => {
              return update$(addOne$);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
