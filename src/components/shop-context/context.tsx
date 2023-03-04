import {
  $,
  component$,
  createContextId,
  useTask$,
  useStore,
  Slot,
  useContextProvider,
  useContext,
} from "@builder.io/qwik";
import { gql } from "graphql-request";
import {
  ActiveOrderQuery,
  ActiveCustomerQuery,
  AddToOrderMutation,
  AdjustOrderLineMutation,
  RemoveOrderLineMutation,
  SetCustomerDetailsMutation,
} from "~/gql/graphql";
import { useQuery, useMutation } from "~/gql/api";

export const setCustomerDetailsMutation = gql`
  mutation SetCustomerDetails($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      __typename
    }
  }
`;

export const activeCustomerQuery = gql`
  query ActiveCustomer {
    activeCustomer {
      title
      firstName
      lastName
      phoneNumber
      emailAddress
      addresses {
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        defaultShippingAddress
        defaultBillingAddress
      }
      user {
        verified
        lastLogin
      }
    }
  }
`;

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
      customer {
        firstName
        lastName
        emailAddress
      }
      lines {
        id
        previewUrl
        productVariant {
          id
          name
          price
          customFields {
            height
            width
            material
          }
        }
        quantity
        customFields {
          fileId
          transformation
        }
        linePriceWithTax
      }
    }
  }
`;

export const adjustOrderLineMutation = gql`
  mutation AdjustOrderLine(
    $orderLineId: ID!
    $quantity: Int!
    $customFields: OrderLineCustomFieldsInput
  ) {
    adjustOrderLine(
      orderLineId: $orderLineId
      quantity: $quantity
      customFields: $customFields
    ) {
      __typename
    }
  }
`;

export const removeOrderLineMutation = gql`
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      __typename
    }
  }
`;

export const addItemToOrderMutation = gql`
  mutation AddToOrder(
    $productVariantId: ID!
    $quantity: Int!
    $fileId: String!
    $transformation: String!
  ) {
    addItemToOrder(
      productVariantId: $productVariantId
      quantity: $quantity
      customFields: { transformation: $transformation, fileId: $fileId }
    ) {
      __typename
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

interface ShopContext {
  order?: ActiveOrderQuery["activeOrder"];
  customer?: ActiveCustomerQuery["activeCustomer"];
  fetchCounter: number;
}

export const ShopContext = createContextId<ShopContext>("shop-context");

export const ShopProvider = component$(() => {
  const getOrder$ = useQuery<ActiveOrderQuery>(activeOrderQuery);
  const getCustomer$ = useQuery<ActiveCustomerQuery>(activeCustomerQuery);
  const state = useStore<ShopContext>({ fetchCounter: 0 });
  useContextProvider(ShopContext, state);

  useTask$(async ({ track }) => {
    track(() => state.fetchCounter);
    const orderResult = await getOrder$();
    const customerResult = await getCustomer$();
    state.order = orderResult.activeOrder;
    state.customer = customerResult.activeCustomer;
  });

  return (
    <>
      <Slot />
    </>
  );
});

export function addToOrder(
  productVariantId: string,
  quantity: number,
  fileId: string,
  transformation: string
) {
  const { exec$, result } = useMutation<AddToOrderMutation>(
    addItemToOrderMutation
  );
  const context = useContext(ShopContext);

  const execute$ = $(async () => {
    await exec$({
      productVariantId,
      quantity,
      fileId,
      transformation,
    });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result };
}

export function removeOrderLine(orderLineId: string) {
  const { exec$, result } = useMutation<RemoveOrderLineMutation>(
    removeOrderLineMutation
  );
  const context = useContext(ShopContext);

  return $(async () => {
    await exec$({
      orderLineId,
    });

    context.fetchCounter++;
    return result;
  });
}

export function changeQuantity(orderLineId: string, quantity: number) {
  const { exec$, result } = useMutation<AdjustOrderLineMutation>(
    adjustOrderLineMutation
  );
  const context = useContext(ShopContext);

  return $(async () => {
    await exec$({ orderLineId, quantity });

    context.fetchCounter++;
    return result;
  });
}

export function setCustomerDetails() {
  const { exec$, result } = useMutation<SetCustomerDetailsMutation>(setCustomerDetailsMutation);
  const context = useContext(ShopContext);

  const execute$ = $(async (firstName: string, lastName: string, emailAddress: string) => {
    await exec$({ input: { firstName, lastName, emailAddress } });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result }
}
