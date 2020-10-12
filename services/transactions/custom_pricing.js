import { getListingData } from "../sharetribe_admin";
import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  LINE_ITEM_NIGHT
} from "./types";

//Add business logic for calculating transaction here
const createLineItems = ({ listing, params }) => {
  // const { bookingStart, bookingEnd, bookingDisplayStart, bookingDisplayEnd, protectedData = {} } = params;
  const { price } = listing.attributes;

  const lineItems = [
    {
      code: LINE_ITEM_NIGHT,
      unitPrice: price,
      quantity: 1,
      lineTotal: price,
      includeFor: ["customer", "provider"]
    },
    {
      code: LINE_ITEM_CUSTOMER_COMMISSION,
      unitPrice: price,
      percentage: 10,
      includeFor: ["customer"]
    },
    {
      code: LINE_ITEM_PROVIDER_COMMISSION,
      unitPrice: price,
      percentage: -10,
      includeFor: ["provider"]
    },
  ];

  return lineItems;
}

const handleLineItemsCreation = ({ listing, listingId, params }) => {
  const processListing = () => listing
    ? Promise.resolve(listing)
    : getListingData({ listingId })
  return processListing()
    .then(listing => {
      return createLineItems({ listing, params });
    })
};

export default handleLineItemsCreation
