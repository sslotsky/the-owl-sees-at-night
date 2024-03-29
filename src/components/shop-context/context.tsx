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
  SetOrderShippingAddressMutation,
  CreateAddressInput,
  CreateCustomerInput,
  EligibleShippingMethodsQuery,
  SetOrderShippingMethodMutation,
} from "~/gql/graphql";
import { useQuery, useMutation } from "~/gql/api";

export const setShippingMethodMutation = gql`
  mutation SetOrderShippingMethod($shippingMethodId: ID!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      __typename
    }
  }
`;

export const shippingMethodsQuery = gql`
  query EligibleShippingMethods {
    eligibleShippingMethods {
      id
      price
      priceWithTax
      code
      name
      description
    }
  }
`;

export const setShippingAddressMutation = gql`
  mutation SetOrderShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      __typename
    }
  }
`;

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
      shippingAddress {
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
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
      shippingLines {
        shippingMethod {
          id
          code
          name
        }
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
  flash: {
    error?: string;
    success?: string;
  }
}

export const ShopContext = createContextId<ShopContext>("shop-context");

export const ShopProvider = component$(() => {
  const getOrder$ = useQuery<ActiveOrderQuery>(activeOrderQuery);
  const state = useStore<ShopContext>({ fetchCounter: 0, flash: {} }, { deep: true });
  useContextProvider(ShopContext, state);

  useTask$(async ({ track }) => {
    track(() => state.fetchCounter);
    const orderResult = await getOrder$();
    state.order = orderResult.activeOrder;
  });

  useTask$(async ({ track }) => {
    track(() => state.flash.error);
    track(() => state.flash.success);

    if (state.flash.error) {
      setTimeout(() => {
        state.flash.error = undefined;
      }, 10000);
    }

    if (state.flash.success) {
      setTimeout(() => {
        state.flash.success = undefined;
      }, 10000);
    }
  })

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

  const execute$ = $(async (input: CreateCustomerInput) => {
    await exec$({ input });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result }
}

export function setShippingAddress() {
  const { exec$, result } = useMutation<SetOrderShippingAddressMutation>(setShippingAddressMutation);

  const context = useContext(ShopContext);

  const execute$ = $(async (input: CreateAddressInput) => {
    await exec$({ input });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result }
}

export function setShippingMethod() {
  const { exec$, result } = useMutation<SetOrderShippingMethodMutation>(setShippingMethodMutation);

  const context = useContext(ShopContext);

  const execute$ = $(async (shippingMethodId: string) => {
    await exec$({ shippingMethodId });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result };
}

export function shippingMethods() {
  const exec$ = useQuery<EligibleShippingMethodsQuery>(shippingMethodsQuery);

  return $(async () => {
    return exec$();
  });
}