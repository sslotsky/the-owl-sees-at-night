import { component$, useContext, useStyles$, $, QwikFocusEvent, useStore } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import { UsaStates } from "usa-states";
import { ShopContext, setCustomerDetails, activeOrderQuery, setShippingAddress } from "~/components/shop-context/context";
import { request as gqlRequest } from "~/gql/api";
import { ActiveOrderQuery } from "~/gql/graphql";
import styles from "./checkout.css?inline";

export const onGet: RequestHandler = async ({ response }) => {
  const { data } = await gqlRequest<ActiveOrderQuery>(activeOrderQuery);
  
  if (!data.activeOrder) {
    throw response.redirect('/custom-prints');
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
  
  const { execute$: setCustomerDetails$ } = setCustomerDetails();
  const { execute$: setShippingAddress$ } = setShippingAddress();
  const updateDetails$ = $((e: QwikFocusEvent) => {
    const form = e.target.closest('form');
    if (!form?.checkValidity()) {
      return;
    }

    if (form.action.endsWith('setCustomerDetails')) {
      setCustomerDetails$(
        userDetails.firstName,
        userDetails.lastName,
        userDetails.emailAddress,
      )
    } else if (form.action.endsWith('setShippingDetails')) {
      setShippingAddress$(shippingDetails);
    }
  });

  const updateUser = (field: keyof typeof userDetails) => $((_evt: Event, el: HTMLInputElement) => {
    userDetails[field] = el.value;
  });

  const updateShippingAddress = (field: keyof typeof shippingDetails) => $((_evt: Event, el: HTMLInputElement) => {
    shippingDetails[field] = el.value;
  });

  return (
    <div class="two-column-grid two-letter-gap">
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
          <form action="setShippingDetails">
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
        <div>
          <h2>Delivery Method</h2>
        </div>
      </div>
      <div></div>
    </div>
  );
});