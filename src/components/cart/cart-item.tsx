
import { component$ } from '@builder.io/qwik';
import { ActiveOrderQuery } from '~/gql/graphql';
import { Unarray } from '~/routes/custom-prints/types';

export function formatPrice(cents: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return formatter.format(cents / 100)
}

type OrderLine = Unarray<NonNullable<ActiveOrderQuery["activeOrder"]>["lines"]>

export default component$((props: { line: OrderLine }) => {
  const { line } = props;
  return (
    <div class="cart-item">
      <img src={line.previewUrl} />
      <div class="product-text">
        <span>{line.productVariant.name}</span>
        <span>{line.quantity}x @ {formatPrice(line.productVariant.price)}</span>
        <span>{formatPrice(line.linePriceWithTax)}</span>
      </div>
    </div>
  );
});