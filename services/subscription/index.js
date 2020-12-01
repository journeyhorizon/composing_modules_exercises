import { addFinalizeResponseFnc } from "../utils";
import create from "./create";
import plan from "./plan";

const sdk = {
  // get,
  // query,
  create,
  // update,
  // cancel,
  plan,
  // invoices: {
  //   get,
  //   query
  // }
};

const subscriptionSdk = addFinalizeResponseFnc(sdk);

export default subscriptionSdk;