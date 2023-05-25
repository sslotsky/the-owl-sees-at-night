import type { QwikFocusEvent} from "@builder.io/qwik";
import { component$, useContext, useStyles$, $, useStore, useSignal, useResource$, Resource } from "@builder.io/qwik";
import type { RequestHandler} from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { UsaStates } from "usa-states";
import { formatPrice } from "~/utils/format";
import { ShopContext, useSetCustomerDetails, activeOrderQuery, useSetShippingAddress, useSetShippingMethod, useProceedToPayment, setOrderStatus } from "~/components/shop-context/context";
import { graphqlRequestHandler, sdk } from "~/graphql/api";
import styles from "./checkout.css?inline";
import Input from "~/components/forms/input";
import type { ActiveOrderQuery, SetOrderStatusMutation, EligibleShippingMethodsQuery } from "~/generated/graphql";

export const UNEXPECTED_ERROR = "An unexpected error occured, please try again!";

export const onGet: RequestHandler = async (event) => {
  const handler = graphqlRequestHandler(event);
  const result = await handler<ActiveOrderQuery>(activeOrderQuery, {});
  
  if (result.kind === 'error') {
    throw new Error('Error fetching active order');
  }

  if (!result.data.activeOrder) {
    throw event.redirect(302, '/');
  }

  if (result.data.activeOrder.state === 'ArrangingPayment') {
    await handler<SetOrderStatusMutation>(setOrderStatus, { status: 'AddingItems' });
  }

}

export default component$(() => {
  useStyles$(styles);
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

  const canProceed = Boolean(
    ctx.order?.customer && ctx.order.shippingAddress && shippingMethod.value
  );
  
  const nav = useNavigate();
  const { execute$: proceed$ } = useProceedToPayment();

  const proceed = $(async () => {
    await proceed$();
    nav('/checkout/payment');
  });

  const { execute$: setCustomerDetails$ } = useSetCustomerDetails();
  const { execute$: setShippingAddress$ } = useSetShippingAddress();
  const { execute$: setShippingMethod$ } = useSetShippingMethod();

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

  const getShippingMethods$ = $(sdk.EligibleShippingMethods);
  const shippingMethodsResource = useResource$(async () => {
    return getShippingMethods$(undefined, { token: ctx.token });
  });

  return (
    <div>
      <div>
        <h2>Contact Information</h2>
        {ctx.customer ? (
          <div></div>
        ) : (
          <form action="setCustomerDetails">
            <div>
              <label>
                Email address
                <Input onBlur$={updateDetails$} type="email" name="email" value={userDetails.emailAddress} onInput$={updateUser('emailAddress')} required />
              </label>
            </div>
            <div class="two-column-grid one-letter-gap">
              <label>
                First name
                <Input onBlur$={updateDetails$} type="text" name="firstName" value={userDetails.firstName} onInput$={updateUser("firstName")} required />
              </label>
              <label>
                Last name
                <Input onBlur$={updateDetails$} type="text" name="lastName" value={userDetails.lastName} onInput$={updateUser("lastName")} required />
              </label>
            </div>
          </form>
        )}
      </div>
      <div>
        <h2>Shipping Information</h2>
        <form action="setShippingDetails">
          <label>
            Name
            <Input onBlur$={updateDetails$} type="text" name="fullName" value={shippingDetails.fullName} onInput$={updateShippingAddress("fullName")} required />
          </label>
          <label>
            Street Address
            <Input onBlur$={updateDetails$} type="text" name="streetLine1" value={shippingDetails.streetLine1} onInput$={updateShippingAddress("streetLine1")} required />
          </label>
          <div class="three-column-grid one-letter-gap">
            <label>
              City
              <Input onBlur$={updateDetails$} type="text" name="city" value={shippingDetails.city} onInput$={updateShippingAddress("city")} required />
            </label>
            <label>
              State
              <Input onBlur$={updateDetails$} type="text" list="us-states" value={shippingDetails.province} onInput$={updateShippingAddress("province")} required />
              <datalist id="us-states">
                {usStates.states.map((state) => (
                  <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
                ))}
              </datalist>
            </label>
            <label>
              Zip
              <Input type="text" name="postalCode" value={shippingDetails.postalCode} onInput$={updateShippingAddress("postalCode")} required />
            </label>
          </div>
        </form>
      </div>
      <div class="delivery-methods">
        <form>
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
                      <label class='card' key={method.id}>
                        {method.name} {formatPrice(method.priceWithTax)}
                        <input required type="radio" name="shipping-method" value={method.id} checked={method.code === shippingMethod.value} onClick$={() => { 
                          if (shippingMethod.value !== method.code) {
                            shippingMethod.value = method.code;
                            setShippingMethod$(method.id).catch(() => {
                              ctx.flash.error = UNEXPECTED_ERROR;
                              shippingMethod.value = undefined;
                            })
                          }
                        }} />
                      </label>
                    )
                  })
                }
              </div>
            )}
          />
        </form>
      </div>
      <div>
        <button class="checkout cta full-width mt-2" disabled={!canProceed} onClick$={proceed}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
        </svg>

          Proceed to payment
        </button>
      </div>
    </div>
  );
});
