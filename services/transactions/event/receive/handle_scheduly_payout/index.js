import { composePromises } from "../../../../utils";
import fetchExistingSubscription from './fetch_existing_subscription';
import createPayoutParams from './create_payout_params';
import createBulkPayout from './create_bulk_payout';

const handleSchedulyPayout = () => {
  /**
   * TODO: Fetch all existing sub, filter by created date, should be created earlier than 3 days from now
   * Because Stripe will need couple of days to process payment
   * Group them by provider
   * Calculate sum amount to payout for provider
   * Initiate Payout
   */
  return composePromises(
    fetchExistingSubscription,
    createPayoutParams,
    createBulkPayout
  )();
}

export default handleSchedulyPayout;