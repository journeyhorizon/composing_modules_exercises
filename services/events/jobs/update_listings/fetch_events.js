import config from "../../../config";
import { denormalisedResponseEntities } from "../../../sharetribe";
import { integrationSdk } from "../../../sharetribe_admin";

//The error margin time to make sure we don't miss any event
const PADDING_TIME = 2000;

const fetchEvents = async ({
  interval: clientInterval,
  types
}) => {
  const interval = clientInterval ||
    config.sharetribeFlex.integration.interval.updateListings;
  const paddingTime = PADDING_TIME;
  const currentTime = new Date().getTime();
  const pointToQuery = currentTime - interval - paddingTime;
  return integrationSdk.events.query({
    createdAtStart: (new Date(pointToQuery)).toISOString(),
    eventTypes: types.join(',')
  })
    .then(res => {
      return denormalisedResponseEntities(res);
    });
}

export default fetchEvents;