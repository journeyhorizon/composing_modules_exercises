import { composePromises } from "../../../utils";
import { LISTING_DELETED, LISTING_UPDATED } from "../../types";
import fetchEvents from './fetch_events';
import processPortData from './process_port_data';
import processCorrespondData from './process_correspond_data';
import finalise from './finalise';
import config from "../../../config";

const DEFAULT_TYPES_TO_FETCH = [
  LISTING_UPDATED,
  LISTING_DELETED
];

const updateListings = async ({
  interval,
  subscribedEvents
}) => {
  return composePromises(
    fetchEvents,
    processPortData,
    processCorrespondData,
    finalise
  )({
    interval: interval || config.sharetribeFlex.integration.interval.updateListings,
    types: subscribedEvents || DEFAULT_TYPES_TO_FETCH
  });
}

export default updateListings;