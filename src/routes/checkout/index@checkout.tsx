import { component$, useContext, useStyles$, $, QwikFocusEvent } from "@builder.io/qwik";
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
  const { execute$ } = setCustomerDetails();
  const updateDetails$ = $((e: QwikFocusEvent) => {
    const form = e.target.closest('form');
    if (!form?.checkValidity()) {
      return;
    }

    const formData = new FormData(form);
    if (form.action.endsWith('setCustomerDetails')) {
      execute$(
        formData.get('firstName') as string,
        formData.get('lastName') as string,
        formData.get('email') as string
      )
    }
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
                  <input onBlur$={updateDetails$} type="email" name="email" required />
                </label>
              </div>
              <div class="two-column-grid one-letter-gap">
                <label>
                  First name
                  <input onBlur$={updateDetails$} type="text" name="firstName" required />
                </label>
                <label>
                  Last name
                  <input onBlur$={updateDetails$} type="text" name="lastName" required />
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