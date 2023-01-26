import { Resource, component$, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentHead, RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { gql } from 'graphql-request';
import { CustomPrintQuery } from '~/gql/graphql';
import { appRouter, MasonryPhoto } from '~/trcp/router';
import CustomPrints from './custom-prints';
import styles from './custom-prints.css?inline';
import { request as gqlRequest } from '~/gql/api';

interface PageData {
  files: MasonryPhoto[];
  productData: CustomPrintQuery;
}

export const onGet: RequestHandler<PageData> = async () => {
  const caller = appRouter.createCaller({});
  const productDataResponse = await gqlRequest<CustomPrintQuery>(customPrintQuery);
  const productData = productDataResponse.data;
  const files = await caller.searchPhotos();
  return { productData, files }
}

export const customPrintQuery = gql`
  query CustomPrint {
    product(slug: "custom-print-3") {
      id
      name
      slug
      variants {
        id
        sku
        name
        customFields {
          height
          width
          material
        }
      }

    }
  }
`

export default component$(() => {
  useStylesScoped$(styles);
  const data = useEndpoint<PageData>();
  
  return (
    <Resource
      value={data}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={({ files, productData }) => (
        <CustomPrints files={files} productData={productData} />
      )}
    />
  )
});


export const head: DocumentHead = {
  title: 'Custom Prints',
  meta: [
    {
      name: 'description',
      content: 'Design your own custom prints',
    },
  ],
};

