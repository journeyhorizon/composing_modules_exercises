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

const addFinalizeResponseFnc = (wrapper) => {
  return Object.entries(wrapper)
    .reduce((currentWrapper, [key, values]) => {
      if (values instanceof Function) {
        const fnc = values;
        currentWrapper[key] = (...args) =>
          fnc(...args)
            .then(res => {
              return {
                code: res.status || res.code,
                data: res.data
              };
            })
            .catch(e => {
              console.error(e);
              console.log({
                e
              })
              return {
                code: e.status || e.code
                  ? e.status || e.code
                  : 500,
                data: e.data ? e.data : e.toString()
              };
            });
      } else {
        currentWrapper[key] = addFinalizeResponseFnc(values);
      }
      return currentWrapper;
    }, {});
}

const finalizedOnBeHalfOfSdk = addFinalizeResponseFnc(OnBeHalfOfSdk);

export default finalizedOnBeHalfOfSdk;