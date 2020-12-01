import create from "./current_user/create";
import show from "./listings/show";
import ownListingsShow from "./own_listings/show";
import close from "./own_listings/close";
import createDraft from "./own_listings/createDraft";
import open from "./own_listings/open";
import publishDraft from "./own_listings/publishDraft";
import update from "./own_listings/update";
import login from "./login";
import request from "./password_reset/request";
import { addFinalizeResponseFnc } from "../utils";

const OnBeHalfOfSdk = {
  ownListings: {
    createDraft,
    publishDraft,
    update,
    close,
    open,
    show: ownListingsShow
  },
  currentUser: {
    create,
  },
  listings: {
    show
  },
  passwordReset: {
    request
  },
  login
};

const finalizedOnBeHalfOfSdk = addFinalizeResponseFnc(OnBeHalfOfSdk);

export default finalizedOnBeHalfOfSdk;