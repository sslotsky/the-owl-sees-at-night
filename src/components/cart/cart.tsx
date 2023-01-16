import { component$, useContext, useStylesScoped$ } from '@builder.io/qwik';
import { RequestHandler } from '@builder.io/qwik-city';
import { appRouter, MasonryPhoto } from '~/trcp/router';
import { ShopContext } from '~/components/shop-context/context';
import styles from './cart.css?inline';

export function formatPrice(cents: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return formatter.format(cents / 100)
}

export const onGet: RequestHandler<MasonryPhoto> = async ({ params }) => {
  const caller = appRouter.createCaller({});
  return caller.getPhoto(params.fileId)
}

export default component$(() => {
  useStylesScoped$(styles);
  const shopState = useContext(ShopContext);
  const count = shopState.order ? shopState.order.lines.reduce((memo, line) => memo + line.quantity, 0) : 0;

  console.log(shopState.order?.lines)
  return (
    <div class="cart">
      <div class="shopping-bag">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clip-rule="evenodd" />
        </svg>
        <span class="count">{count}</span>
      </div>
      <div class="side-panel">
        {shopState.order?.lines.length ? shopState.order?.lines.map((line) => (
          <div class="cart-item">
            <img src={line.previewUrl} />
            <div class="product-text">
              <span>{line.productVariant.name}</span>
              <span>{line.quantity}x @ {formatPrice(line.productVariant.price)}</span>
              <span>{formatPrice(line.linePriceWithTax)}</span>
            </div>
          </div>
        )) : (
          <p>No items in cart</p>
        )}
      </div>
    </div>
  );
});
