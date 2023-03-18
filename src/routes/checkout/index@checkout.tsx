import { component$, useContext, useStyles$, $, QwikFocusEvent, useStore, useSignal, useResource$, Resource } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import { UsaStates } from "usa-states";
import CartItem from "~/components/cart/cart-item";
import { formatPrice } from "~/utils/format";
import { ShopContext, setCustomerDetails, activeOrderQuery, setShippingAddress, shippingMethods, setShippingMethod } from "~/components/shop-context/context";
import { request as gqlRequest } from "~/gql/api";
import { ActiveOrderQuery, EligibleShippingMethodsQuery } from "~/gql/graphql";
import styles from "./checkout.css?inline";
import cartStyles from '~/components/cart/cart.css?inline';

export const UNEXPECTED_ERROR = "An unexpected error occured, please try again!";

export const onGet: RequestHandler = async ({ response }) => {
  const { data } = await gqlRequest<ActiveOrderQuery>(activeOrderQuery);
  
  if (!data.activeOrder) {
    throw response.redirect('/custom-prints');
  }

}

export default component$(() => {
  useStyles$(styles);
  useStyles$(cartStyles);
  const usStates = new UsaStates();
  const ctx = useContext(ShopContext);
  const userDetails = useStore({
    firstName: ctx.order?.customer?.firstName || '',
    lastName: ctx.order?.customer?.lastName || '',
    emailAddress: ctx.order?.customer?.emailAddress || ''
  });

  const shippingDetails = useStore({
    fullName: ctx.order?.shippingAddress?.fullName || (
      ctx.order?.customer ? `${ctx.order.customer.firstName} ${ctx.order.customer.lastName}` : ''
    ),
    streetLine1: ctx.order?.shippingAddress?.streetLine1 || '',
    streetLine2: ctx.order?.shippingAddress?.streetLine2 || '',
    city: ctx.order?.shippingAddress?.city || '',
    province: ctx.order?.shippingAddress?.province || '',
    postalCode: ctx.order?.shippingAddress?.postalCode || '',
    countryCode: 'USA',
  });

  const shippingMethod = useSignal(
    ctx.order?.shippingLines[0]?.shippingMethod.code
  );

  const [contactForm, shippingForm] = [useSignal<HTMLFormElement>(), useSignal<HTMLFormElement>()];
  const canProceed = Boolean(shippingMethod.value) && [contactForm, shippingForm].every((form) => {
    return Boolean(form.value?.checkValidity());
  });
  
  const { execute$: setCustomerDetails$ } = setCustomerDetails();
  const { execute$: setShippingAddress$ } = setShippingAddress();
  const { execute$: setShippingMethod$ } = setShippingMethod();

  const updateDetails$ = $((e: QwikFocusEvent) => {
    const form = e.target.closest('form');
    if (!form?.checkValidity()) {
      return;
    }

    if (form.action.endsWith('setCustomerDetails')) {
      setCustomerDetails$(userDetails).catch(() => {
        ctx.flash.error = UNEXPECTED_ERROR;
        form.reset();
      });
    } else if (form.action.endsWith('setShippingDetails')) {
      setShippingAddress$(shippingDetails).catch(() => {
        ctx.flash.error = UNEXPECTED_ERROR;
        form.reset();
      });
    }
  });

  const updateUser = (field: keyof typeof userDetails) => $((_evt: Event, el: HTMLInputElement) => {
    userDetails[field] = el.value;
  });

  const updateShippingAddress = (field: keyof typeof shippingDetails) => $((_evt: Event, el: HTMLInputElement) => {
    shippingDetails[field] = el.value;
  });

  const getShippingMethods$ = shippingMethods();
  const shippingMethodsResource = useResource$(async () => {
    return getShippingMethods$();
  })

  return (
    <div class="two-column-grid two-letter-gap">
      <div>
        <div>
          <h2>Contact Information</h2>
          {ctx.customer ? (
            <div></div>
          ) : (
            <form action="setCustomerDetails" ref={contactForm}>
              <div>
                <label>
                  Email address
                  <input onBlur$={updateDetails$} type="email" name="email" value={userDetails.emailAddress} onInput$={updateUser('emailAddress')} required />
                </label>
              </div>
              <div class="two-column-grid one-letter-gap">
                <label>
                  First name
                  <input onBlur$={updateDetails$} type="text" name="firstName" value={userDetails.firstName} onInput$={updateUser("firstName")} required />
                </label>
                <label>
                  Last name
                  <input onBlur$={updateDetails$} type="text" name="lastName" value={userDetails.lastName} onInput$={updateUser("lastName")} required />
                </label>
              </div>
            </form>
          )}
        </div>
        <div>
          <h2>Shipping Information</h2>
          <form action="setShippingDetails" ref={shippingForm}>
            <label>
              Name
              <input onBlur$={updateDetails$} type="text" name="fullName" value={shippingDetails.fullName} onInput$={updateShippingAddress("fullName")} required />
            </label>
            <label>
              Street Address
              <input onBlur$={updateDetails$} type="text" name="streetLine1" value={shippingDetails.streetLine1} onInput$={updateShippingAddress("streetLine1")} required />
            </label>
            <div class="three-column-grid one-letter-gap">
              <label>
                City
                <input onBlur$={updateDetails$} type="text" name="city" value={shippingDetails.city} onInput$={updateShippingAddress("city")} required />
              </label>
              <label>
                State
                <input onBlur$={updateDetails$} type="text" list="us-states" value={shippingDetails.province} onInput$={updateShippingAddress("province")} required />
                <datalist id="us-states">
                  {usStates.states.map((state) => (
                    <option value={state.abbreviation}>{state.name}</option>
                  ))}
                </datalist>
              </label>
              <label>
                Zip
                <input type="text" name="postalCode" value={shippingDetails.postalCode} onInput$={updateShippingAddress("postalCode")} required />
              </label>
            </div>
          </form>
        </div>
        <div class="delivery-methods">
          <h2>Delivery Method</h2>
          <Resource
            value={shippingMethodsResource}
            onResolved={(data: EligibleShippingMethodsQuery) => (
              <div class="three-column-grid one-letter-gap">
                {
                  data.eligibleShippingMethods.map((method) => {
                    const classes = ['card'];
                    if (method.code === shippingMethod.value) {
                      classes.push('active');
                    }

                    return (
                      <div
                        class={classes.join(' ')}
                        onClick$={() => {
                          shippingMethod.value = method.code;
                          setShippingMethod$(method.id).catch(() => {
                            ctx.flash.error = UNEXPECTED_ERROR;
                            shippingMethod.value = undefined;
                          });
                        }}
                      >
                        <div class="flex-columns full-width">
                          <span class={shippingMethod.value}>{method.name}</span>
                          <span>{formatPrice(method.priceWithTax)}</span>
                        </div>
                        <div class="selected">
                          &#10003;
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}
          />
        </div>
        <div>
          <button class="checkout cta full-width mt-2" disabled={!canProceed}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
          </svg>

            Proceed to payment
          </button>
        </div>
      </div>
      <div>
        <h2>Order Summary</h2>
          {ctx.order?.lines.map((line) => (
            <CartItem key={line.id} line={line} />
          ))}
          <div class="cart-summary">
            <div class="subtotal">
              <p>Subtotal</p>
              <p>{ctx.order && formatPrice(ctx.order.subTotalWithTax)}</p>
            </div>
          </div>
      </div>
    </div>
  );
});