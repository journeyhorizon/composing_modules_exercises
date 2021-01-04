import { LISTING_STATE_CLOSED, LISTING_STATE_PUBLISHED } from "../../../../../on_behalf_of/types";
import handlePortOpened from './handle_port_open';
import handlePortClosure from './handle_port_closure';

const handleUpdateProductsState = async ({ events, authorId }) => {
  return Promise.all(events.map(event => {
    const {
      attributes: {
        resource: listing,
        resourceId: {
          uuid
        },
      }
    } = event;


    if (!listing) {
      return handlePortClosure({ id: uuid, authorId, deleted: true });
    }

    const {
      attributes: {
        state
      }
    } = listing;

    if (state === LISTING_STATE_CLOSED) {
      return handlePortClosure({ id: uuid, authorId });
    } else if (state === LISTING_STATE_PUBLISHED) {
      return handlePortOpened({ id: uuid });
    } else {
      return;
    }
  }));
}

export default handleUpdateProductsState;