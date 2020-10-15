import createDraft from "./own_listings/createDraft";
import publishDraft from "./own_listings/publishDraft";
import update from "./own_listings/update";

const OnBeHalfOfSdk = {
  ownListings: {
    createDraft,
    publishDraft,
    update
  }
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