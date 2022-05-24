import { addFinalizeResponseFnc } from "../utils";
import create from "./create";
import get from "./get";
import plan from "./plan";
import update from "./update";
import cancel from "./cancel";
import resume from "./resume";

const sdk = {
  get,
  create,
  update,
  cancel,
  resume,
  plan,
};

const subscriptionSdk = addFinalizeResponseFnc(sdk);

export default subscriptionSdk;