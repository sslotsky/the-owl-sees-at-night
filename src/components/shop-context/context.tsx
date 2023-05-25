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

import { useMutation } from "~/graphql/api";
import { sdk } from "~/graphql/api";
import { activeOrderQuery, setOrderStatus } from "./queries";
import type { ActiveOrderQuery, ActiveCustomerQuery, CreateCustomerInput, CreateAddressInput } from "~/generated/graphql";


interface ShopContext {
  order?: ActiveOrderQuery["activeOrder"];
  customer?: ActiveCustomerQuery["activeCustomer"];
  token?: string;
  fetchCounter: number;
  flash: {
    error?: string;
    success?: string;
  }
}

export const ShopContext = createContextId<ShopContext>("shop-context");

interface ProviderProps {
  token?: string;
}

export const ShopProvider = component$((props: ProviderProps) => {
  const state = useStore<ShopContext>({ token: props.token, fetchCounter: 0, flash: {} }, { deep: true });
  useContextProvider(ShopContext, state);

  useTask$(async ({ track }) => {
    track(() => state.fetchCounter);
    track(() => state.token);
    const orderResult = await sdk.ActiveOrder({}, { token: state.token });
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

export function useAddToOrder() {
  const context = useContext(ShopContext);

  const { exec$, result } = useMutation($(sdk.AddToOrder));
  
  const execute$ = $(async (args: {
    productVariantId: string;
    quantity: number;
    fileId: string;
    transformation: string;
  }) => {
    await exec$(args);

    context.fetchCounter++;
    return result;
  });

  return { execute$, result };
}

export function useRemoveOrderLine(orderLineId: string) {
  const { exec$, result } = useMutation($(sdk.RemoveOrderLine));
  const context = useContext(ShopContext);

  return $(async () => {
    await exec$({
      orderLineId,
    });

    context.fetchCounter++;
    return result;
  });
}

export function useAddOne(orderLineId: string) {
  const { exec$, result } = useMutation($(sdk.AdjustOrderLine));
  const context = useContext(ShopContext);

  return $(async () => {
    const line = context.order?.lines.find((l) => l.id === orderLineId);
    if (line) {
      await exec$({ orderLineId, quantity: line.quantity + 1 });

      context.fetchCounter++;
    }

    return result;
  });
}

export function useRemoveOne(orderLineId: string) {
  const { exec$, result } = useMutation($(sdk.AdjustOrderLine));
  const context = useContext(ShopContext);

  return $(async () => {
    const line = context.order?.lines.find((l) => l.id === orderLineId);
    if (line?.quantity && line.quantity > 1) {
      await exec$({ orderLineId, quantity: line.quantity - 1 });

      context.fetchCounter++;
    }

    return result;
  });
}

export function useSetCustomerDetails() {
  const { exec$, result } = useMutation($(sdk.SetCustomerDetails));
  const context = useContext(ShopContext);

  const execute$ = $(async (input: CreateCustomerInput) => {
    await exec$({ input });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result }
}

export function useSetShippingAddress() {
  const { exec$, result }  = useMutation($(sdk.SetOrderShippingAddress));

  const context = useContext(ShopContext);

  const execute$ = $(async (input: CreateAddressInput) => {
    await exec$({ input });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result }
}

export function useSetShippingMethod() {
  const { exec$, result } = useMutation($(sdk.SetOrderShippingMethod));

  const context = useContext(ShopContext);

  const execute$ = $(async (shippingMethodId: string) => {
    await exec$({ shippingMethodId });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result };
}

export function useProceedToPayment() {
  const { exec$, result } = useMutation($(sdk.SetOrderStatus));

  const context = useContext(ShopContext);
  const execute$ = $(async () => {
    await exec$({ status: 'ArrangingPayment' });

    context.fetchCounter++;
    return result;
  });

  return { execute$, result };
}

export function useGetOrderByCode(code: string) {
  const ctx = useContext(ShopContext);
  return $(async () => sdk.GetOrderByCode({ code }, { token: ctx.token }));
}

export { activeOrderQuery, setOrderStatus };

