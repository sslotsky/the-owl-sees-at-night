import { component$, useContext, useStylesScoped$ } from '@builder.io/qwik';
import { RequestHandler } from '@builder.io/qwik-city';
import { appRouter, MasonryPhoto } from '~/trcp/router';
import { ShopContext } from '~/components/shop-context/context';
import styles from './cart.css?inline';

export const onGet: RequestHandler<MasonryPhoto> = async ({ params }) => {
  const caller = appRouter.createCaller({});
  return caller.getPhoto(params.fileId)
}

export default component$(() => {
  useStylesScoped$(styles);
  const shopState = useContext(ShopContext);
  const count = shopState.order ? shopState.order.lines.reduce((memo, line) => memo + line.quantity, 0) : 0;

  return (
    <div class="cart">{count}</div>
  );
});
