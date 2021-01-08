import { addFinalizeResponseFnc } from "../utils";
import create from "./create";

const sdk = {
  create,
};

const productStripeSdk = addFinalizeResponseFnc(sdk);

export default productStripeSdk;