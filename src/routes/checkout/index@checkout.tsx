import { component$, useContext, useStyles$, $, QwikFocusEvent, useStore } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import { ShopContext, setCustomerDetails, activeOrderQuery } from "~/components/shop-context/context";
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
  const ctx = useContext(ShopContext);
  const userDetails = useStore({
    firstName: ctx.order?.customer?.firstName || '',
    lastName: ctx.order?.customer?.lastName || '',
    emailAddress: ctx.order?.customer?.emailAddress || ''
  })
  
  const { execute$ } = setCustomerDetails();
  const updateDetails$ = $((e: QwikFocusEvent) => {
    const form = e.target.closest('form');
    if (!form?.checkValidity()) {
      return;
    }

    if (form.action.endsWith('setCustomerDetails')) {
      execute$(
        userDetails.firstName,
        userDetails.lastName,
        userDetails.emailAddress,
      )
    }
  });

  const updateUser = (field: keyof typeof userDetails) => $((_evt: Event, el: HTMLInputElement) => {
    userDetails[field] = el.value;
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
        </div>
        <div>
          <h2>Delivery Method</h2>
        </div>
      </div>
      <div></div>
    </div>
  );
});