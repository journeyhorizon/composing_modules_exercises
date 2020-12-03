import { addFinalizeResponseFnc } from "../utils";
import create from "./create";
import get from "./get";
import plan from "./plan";
import speculate from "./speculate";

const sdk = {
  get,
  // query,
  create,
  speculate,
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