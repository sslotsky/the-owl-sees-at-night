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
    "\n  query ActiveOrder {\n    activeOrder {\n      id\n      code\n      state\n      couponCodes\n      subTotalWithTax\n      shippingWithTax\n      totalWithTax\n      totalQuantity\n      lines {\n        id\n        previewUrl\n        productVariant {\n          id\n          name\n          price\n          customFields {\n            height\n            width\n            material\n          }\n        }\n        quantity\n        customFields {\n          fileId\n          transformation\n        }\n        linePriceWithTax\n      }\n    }\n  }\n": types.ActiveOrderDocument,
    "\n  mutation AddToOrder($productVariantId: ID!, $quantity: Int!, $fileId: String!, $transformation: String!) {\n    addItemToOrder(\n      productVariantId: $productVariantId, \n      quantity: $quantity, \n      customFields:{\n        transformation:$transformation,\n        fileId:$fileId\n      }\n    ) {\n      __typename\n      ... on ErrorResult{\n        errorCode\n        message\n      }\n    }\n  }\n": types.AddToOrderDocument,
    "\n  query CustomPrint {\n    product(slug: \"custom-print\") {\n      id\n      name\n      slug\n      variants {\n        id\n        sku\n        name\n        customFields {\n          height\n          width\n          material\n        }\n      }\n\n    }\n  }\n": types.CustomPrintDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveOrder {\n    activeOrder {\n      id\n      code\n      state\n      couponCodes\n      subTotalWithTax\n      shippingWithTax\n      totalWithTax\n      totalQuantity\n      lines {\n        id\n        previewUrl\n        productVariant {\n          id\n          name\n          price\n          customFields {\n            height\n            width\n            material\n          }\n        }\n        quantity\n        customFields {\n          fileId\n          transformation\n        }\n        linePriceWithTax\n      }\n    }\n  }\n"): (typeof documents)["\n  query ActiveOrder {\n    activeOrder {\n      id\n      code\n      state\n      couponCodes\n      subTotalWithTax\n      shippingWithTax\n      totalWithTax\n      totalQuantity\n      lines {\n        id\n        previewUrl\n        productVariant {\n          id\n          name\n          price\n          customFields {\n            height\n            width\n            material\n          }\n        }\n        quantity\n        customFields {\n          fileId\n          transformation\n        }\n        linePriceWithTax\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddToOrder($productVariantId: ID!, $quantity: Int!, $fileId: String!, $transformation: String!) {\n    addItemToOrder(\n      productVariantId: $productVariantId, \n      quantity: $quantity, \n      customFields:{\n        transformation:$transformation,\n        fileId:$fileId\n      }\n    ) {\n      __typename\n      ... on ErrorResult{\n        errorCode\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddToOrder($productVariantId: ID!, $quantity: Int!, $fileId: String!, $transformation: String!) {\n    addItemToOrder(\n      productVariantId: $productVariantId, \n      quantity: $quantity, \n      customFields:{\n        transformation:$transformation,\n        fileId:$fileId\n      }\n    ) {\n      __typename\n      ... on ErrorResult{\n        errorCode\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CustomPrint {\n    product(slug: \"custom-print\") {\n      id\n      name\n      slug\n      variants {\n        id\n        sku\n        name\n        customFields {\n          height\n          width\n          material\n        }\n      }\n\n    }\n  }\n"): (typeof documents)["\n  query CustomPrint {\n    product(slug: \"custom-print\") {\n      id\n      name\n      slug\n      variants {\n        id\n        sku\n        name\n        customFields {\n          height\n          width\n          material\n        }\n      }\n\n    }\n  }\n"];

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