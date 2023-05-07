import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';

import { graphqlRequestHandler } from '~/graphql/api';
import { getPhotos } from '~/image-kit';
import CustomPrints from '~/components/custom-prints/custom-prints';
import { customPrintQuery } from '~/components/shop-context/queries';
import type { CustomPrintQuery } from '~/generated/graphql';

export const useProductData = routeLoader$(async (event) => {
  const handler = graphqlRequestHandler(event);
  const productData = await handler<CustomPrintQuery>(
    customPrintQuery,
    { slug: import.meta.env.PUBLIC_CUSTOM_PRINT_SLUG }
  );

  const files = await getPhotos({
    imageKitId: event.env.get('IMAGE_KIT_ID') ?? '',
    privateKey: event.env.get('IMAGE_KIT_PRIVATE_KEY') ?? '',
    publicKey: event.env.get('IMAGE_KIT_PUBLIC_KEY') ?? ''
  });

  return { productData, files }
});

export default component$(() => {
  const data = useProductData();
  
  return (
    <>
      <CustomPrints files={data.value.files} productData={data.value.productData} />
    </>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
