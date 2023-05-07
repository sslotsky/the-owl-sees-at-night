import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { activeOrderQuery, ShopContext } from "~/components/shop-context/context";
import { graphqlRequestHandler } from "~/graphql/api";
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from "~/components/shop-context/queries";
import type { ActiveOrderQuery, CreatePaymentAttemptMutation } from "~/generated/graphql";

export const usePaymentIntent = routeLoader$(async (event) => {
  const handler = graphqlRequestHandler(event);

  const result = await handler<ActiveOrderQuery>(activeOrderQuery, {});
  
  if (!result.activeOrder) {
    throw event.error(500, "Failed to retrieve active order");
  }

  if (result.activeOrder.state !== 'ArrangingPayment') {
    throw event.redirect(302, '/checkout');
  }

  const paymentIntentResult = await handler<CreatePaymentAttemptMutation>(createPaymentIntent, {});

  return paymentIntentResult.createStripePaymentIntent ?? "";
});

export default component$(() => {
  const intent = usePaymentIntent();
  const paymentElementId = "payment-element";
  const linkElementId = "link-element";
  const form = useSignal<HTMLFormElement>();
  const loaded = useSignal(false);
  const ctx = useContext(ShopContext);
  const location = useLocation();
  const submitting = useSignal(false);

  useVisibleTask$(async () => {
    const stripe = await loadStripe(import.meta.env.PUBLIC_STRIPE_KEY, { apiVersion: "2022-11-15" });
    if (!stripe) {
      return;
    }

    const elements = stripe.elements({
      clientSecret: intent.value || undefined,
      appearance: {
        theme: "night",
        variables: {
          colorPrimaryText: '#faf9f9',
          colorText: '#faf9f9',
          colorPrimary: '#896795'
        }
      }
    });

    const paymentElement = elements.create("payment", { layout: "tabs" });
    paymentElement.mount(`#${paymentElementId}`);

    const linkElement = elements.create("linkAuthentication")
    linkElement.mount(`#${linkElementId}`);

    paymentElement.on("ready", () => {
      loaded.value = true;
    })

    if (form.value) {
      form.value.addEventListener("submit", async (evt) => {
        evt.preventDefault();
        
        submitting.value = true;
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${location.url.origin}/checkout/confirmation/${ctx.order?.code}`
          }
        });

        if (error.type !== "card_error" && error.type !== "validation_error") {
          ctx.flash.error = error.message ?? "An unexpected error occurred with the payment service";
        }

        submitting.value = false;
      });
    }
  });

  return (
    <>
      <h2>Payment Information</h2>
      <form class="card invert pd-1" ref={form}>
        <div id={linkElementId}></div>
        <div id={paymentElementId}>

        </div>
        <div class="mt-1">
          {loaded.value && (
            <button disabled={submitting.value} class="cta flat pd-small" type="submit">Pay Now</button>
          )}
        </div>
      </form>
    </>
  );
});