import { CustomPrintQuery } from "~/gql/graphql";

export type CustomPrint = NonNullable<CustomPrintQuery["product"]>;
export type VariantArray = CustomPrint["variants"];

export type Unarray<T> = T extends Array<infer U> ? U : never;
export type Variant = NonNullable<Unarray<VariantArray>>;
