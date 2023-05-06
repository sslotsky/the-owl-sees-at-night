import { gql } from "~/graphql/api";

export const createPaymentIntent = gql`
  mutation CreatePaymentAttempt {
    createStripePaymentIntent
  }
`;

export const setOrderStatus = gql`
  mutation SetOrderStatus($status: String!) {
    transitionOrderToState(state: $status) {
      __typename
    }
  }
`;

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

export const orderByCodeQuery = gql`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      __typename
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

export const activeOrderQuery = gql`
  query ActiveOrder {
    activeOrder {
      __typename
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

export const customPrintQuery = gql`
  query CustomPrint($slug: String) {
    product(slug: $slug) {
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
`;
