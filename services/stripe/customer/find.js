import { stripe } from ".."
import pick from "lodash/pick";
import { CUSTOMER_ATTRIBUTES_TO_TAKE_FROM_STRIPE } from "./attributes";
import { convertObjToCamelCase } from "../../utils";

const LIMIT = 100;

const find = async (userId, anchor = null) => {
  const params = {
    limit: LIMIT,
  };
  if (anchor) {
    params.starting_after = anchor;
  }
  const customersRes = await stripe.customers.list(params);
  const customers = customersRes.data;
  const customer = customers.find(customer =>
    customer.metadata['sharetribe-user-id'] === userId);

  if (customer) {
    return convertObjToCamelCase(pick(customer, CUSTOMER_ATTRIBUTES_TO_TAKE_FROM_STRIPE));
  }

  if (!customersRes.has_more) {
    return null;
  }

  return find(userId, customers[customers.length - 1].id);
}

export default find;