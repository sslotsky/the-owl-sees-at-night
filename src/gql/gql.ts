/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  mutation SetOrderShippingMethod($shippingMethodId: ID!) {\n    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {\n      __typename\n    }\n  }\n": types.SetOrderShippingMethodDocument,
    "\n  query EligibleShippingMethods {\n    eligibleShippingMethods {\n      id\n      price\n      priceWithTax\n      code\n      name\n      description\n    }\n  }\n": types.EligibleShippingMethodsDocument,
    "\n  mutation SetOrderShippingAddress($input: CreateAddressInput!) {\n    setOrderShippingAddress(input: $input) {\n      __typename\n    }\n  }\n": types.SetOrderShippingAddressDocument,
    "\n  mutation SetCustomerDetails($input: CreateCustomerInput!) {\n    setCustomerForOrder(input: $input) {\n      __typename\n    }\n  }\n": types.SetCustomerDetailsDocument,
    "\n  query ActiveCustomer {\n    activeCustomer {\n      title\n      firstName\n      lastName\n      phoneNumber\n      emailAddress\n      addresses {\n        fullName\n        streetLine1\n        streetLine2\n        city\n        province\n        postalCode\n        defaultShippingAddress\n        defaultBillingAddress\n      }\n      user {\n        verified\n        lastLogin\n      }\n    }\n  }\n": types.ActiveCustomerDocument,
    "\n  query ActiveOrder {\n    activeOrder {\n      id\n      code\n      state\n      couponCodes\n      subTotalWithTax\n      shippingWithTax\n      totalWithTax\n      totalQuantity\n      customer {\n        firstName\n        lastName\n        emailAddress\n      }\n      shippingAddress {\n        fullName\n        streetLine1\n        streetLine2\n        city\n        province\n        postalCode\n      }\n      lines {\n        id\n        previewUrl\n        productVariant {\n          id\n          name\n          price\n          customFields {\n            height\n            width\n            material\n          }\n        }\n        quantity\n        customFields {\n          fileId\n          transformation\n        }\n        linePriceWithTax\n      }\n      shippingLines {\n        shippingMethod {\n          id\n          code\n          name\n        }\n      }\n    }\n  }\n": types.ActiveOrderDocument,
    "\n  mutation AdjustOrderLine(\n    $orderLineId: ID!\n    $quantity: Int!\n    $customFields: OrderLineCustomFieldsInput\n  ) {\n    adjustOrderLine(\n      orderLineId: $orderLineId\n      quantity: $quantity\n      customFields: $customFields\n    ) {\n      __typename\n    }\n  }\n": types.AdjustOrderLineDocument,
    "\n  mutation RemoveOrderLine($orderLineId: ID!) {\n    removeOrderLine(orderLineId: $orderLineId) {\n      __typename\n    }\n  }\n": types.RemoveOrderLineDocument,
    "\n  mutation AddToOrder(\n    $productVariantId: ID!\n    $quantity: Int!\n    $fileId: String!\n    $transformation: String!\n  ) {\n    addItemToOrder(\n      productVariantId: $productVariantId\n      quantity: $quantity\n      customFields: { transformation: $transformation, fileId: $fileId }\n    ) {\n      __typename\n      ... on ErrorResult {\n        errorCode\n        message\n      }\n    }\n  }\n": types.AddToOrderDocument,
    "\n  query CustomPrint {\n    product(slug: \"custom-print-3\") {\n      id\n      name\n      slug\n      variants {\n        id\n        sku\n        name\n        customFields {\n          height\n          width\n          material\n        }\n      }\n    }\n  }\n": types.CustomPrintDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetOrderShippingMethod($shippingMethodId: ID!) {\n    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation SetOrderShippingMethod($shippingMethodId: ID!) {\n    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EligibleShippingMethods {\n    eligibleShippingMethods {\n      id\n      price\n      priceWithTax\n      code\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query EligibleShippingMethods {\n    eligibleShippingMethods {\n      id\n      price\n      priceWithTax\n      code\n      name\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetOrderShippingAddress($input: CreateAddressInput!) {\n    setOrderShippingAddress(input: $input) {\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation SetOrderShippingAddress($input: CreateAddressInput!) {\n    setOrderShippingAddress(input: $input) {\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetCustomerDetails($input: CreateCustomerInput!) {\n    setCustomerForOrder(input: $input) {\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation SetCustomerDetails($input: CreateCustomerInput!) {\n    setCustomerForOrder(input: $input) {\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveCustomer {\n    activeCustomer {\n      title\n      firstName\n      lastName\n      phoneNumber\n      emailAddress\n      addresses {\n        fullName\n        streetLine1\n        streetLine2\n        city\n        province\n        postalCode\n        defaultShippingAddress\n        defaultBillingAddress\n      }\n      user {\n        verified\n        lastLogin\n      }\n    }\n  }\n"): (typeof documents)["\n  query ActiveCustomer {\n    activeCustomer {\n      title\n      firstName\n      lastName\n      phoneNumber\n      emailAddress\n      addresses {\n        fullName\n        streetLine1\n        streetLine2\n        city\n        province\n        postalCode\n        defaultShippingAddress\n        defaultBillingAddress\n      }\n      user {\n        verified\n        lastLogin\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveOrder {\n    activeOrder {\n      id\n      code\n      state\n      couponCodes\n      subTotalWithTax\n      shippingWithTax\n      totalWithTax\n      totalQuantity\n      customer {\n        firstName\n        lastName\n        emailAddress\n      }\n      shippingAddress {\n        fullName\n        streetLine1\n        streetLine2\n        city\n        province\n        postalCode\n      }\n      lines {\n        id\n        previewUrl\n        productVariant {\n          id\n          name\n          price\n          customFields {\n            height\n            width\n            material\n          }\n        }\n        quantity\n        customFields {\n          fileId\n          transformation\n        }\n        linePriceWithTax\n      }\n      shippingLines {\n        shippingMethod {\n          id\n          code\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ActiveOrder {\n    activeOrder {\n      id\n      code\n      state\n      couponCodes\n      subTotalWithTax\n      shippingWithTax\n      totalWithTax\n      totalQuantity\n      customer {\n        firstName\n        lastName\n        emailAddress\n      }\n      shippingAddress {\n        fullName\n        streetLine1\n        streetLine2\n        city\n        province\n        postalCode\n      }\n      lines {\n        id\n        previewUrl\n        productVariant {\n          id\n          name\n          price\n          customFields {\n            height\n            width\n            material\n          }\n        }\n        quantity\n        customFields {\n          fileId\n          transformation\n        }\n        linePriceWithTax\n      }\n      shippingLines {\n        shippingMethod {\n          id\n          code\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdjustOrderLine(\n    $orderLineId: ID!\n    $quantity: Int!\n    $customFields: OrderLineCustomFieldsInput\n  ) {\n    adjustOrderLine(\n      orderLineId: $orderLineId\n      quantity: $quantity\n      customFields: $customFields\n    ) {\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation AdjustOrderLine(\n    $orderLineId: ID!\n    $quantity: Int!\n    $customFields: OrderLineCustomFieldsInput\n  ) {\n    adjustOrderLine(\n      orderLineId: $orderLineId\n      quantity: $quantity\n      customFields: $customFields\n    ) {\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveOrderLine($orderLineId: ID!) {\n    removeOrderLine(orderLineId: $orderLineId) {\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveOrderLine($orderLineId: ID!) {\n    removeOrderLine(orderLineId: $orderLineId) {\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddToOrder(\n    $productVariantId: ID!\n    $quantity: Int!\n    $fileId: String!\n    $transformation: String!\n  ) {\n    addItemToOrder(\n      productVariantId: $productVariantId\n      quantity: $quantity\n      customFields: { transformation: $transformation, fileId: $fileId }\n    ) {\n      __typename\n      ... on ErrorResult {\n        errorCode\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddToOrder(\n    $productVariantId: ID!\n    $quantity: Int!\n    $fileId: String!\n    $transformation: String!\n  ) {\n    addItemToOrder(\n      productVariantId: $productVariantId\n      quantity: $quantity\n      customFields: { transformation: $transformation, fileId: $fileId }\n    ) {\n      __typename\n      ... on ErrorResult {\n        errorCode\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CustomPrint {\n    product(slug: \"custom-print-3\") {\n      id\n      name\n      slug\n      variants {\n        id\n        sku\n        name\n        customFields {\n          height\n          width\n          material\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CustomPrint {\n    product(slug: \"custom-print-3\") {\n      id\n      name\n      slug\n      variants {\n        id\n        sku\n        name\n        customFields {\n          height\n          width\n          material\n        }\n      }\n    }\n  }\n"];

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
**/
export function graphql(source: string): unknown;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;