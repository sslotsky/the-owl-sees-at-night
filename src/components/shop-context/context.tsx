import { $, component$, createContext, useTask$, useStore, Slot, useContextProvider, useContext } from "@builder.io/qwik";
import { gql } from "graphql-request";
import { ActiveOrderQuery, AddToOrderMutation } from "~/gql/graphql";
import { useQuery, useMutation } from '~/gql/api';

export const activeOrderQuery = gql`
  query ActiveOrder {
    activeOrder {
      id
      code
      state
      couponCodes
      subTotalWithTax
      shippingWithTax
      totalWithTax
      totalQuantity
      lines {
        id
        productVariant {
          id
          name
        }
        featuredAsset {
          id
          preview
        }
        quantity
        linePriceWithTax
      }
    }
  }
`;

export const addItemToOrderMutation = gql`
  mutation AddToOrder($productVariantId: ID!, $quantity: Int!, $fileId: String!, $transformation: String!) {
    addItemToOrder(
      productVariantId: $productVariantId, 
      quantity: $quantity, 
      customFields:{
        transformation:$transformation,
        fileId:$fileId
      }
    ) {
      __typename
      ... on ErrorResult{
        errorCode
        message
      }
    }
  }
`;

interface ShopContext {
  order?: ActiveOrderQuery['activeOrder'];
  fetchCounter: number;
}

export const ShopContext = createContext<ShopContext>("shop-context");

export const ShopProvider = component$(() => {
  const exec$ = useQuery<ActiveOrderQuery>(activeOrderQuery);
  const state = useStore<ShopContext>({ fetchCounter: 0 })
  useContextProvider(ShopContext, state);

  useTask$(async ({ track }) => {
    track(() => state.fetchCounter);
    const result = await exec$();
    state.order = result.activeOrder;
  })
  
  return (
    <>
      <Slot />
    </>
  )
})

export function addToOrder(productVariantId: number, quantity: number, fileId: string, transformation: string) {
  const { exec$, result } = useMutation<AddToOrderMutation>(addItemToOrderMutation);
  const context = useContext(ShopContext);

  return $(async () => {
    await exec$({
      productVariantId,
      quantity,
      fileId,
      transformation
    });

    context.fetchCounter++;
    return result;
  });
}