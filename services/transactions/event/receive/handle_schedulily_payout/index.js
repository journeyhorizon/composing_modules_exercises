import { composePromises } from "../../../../utils";
import createStripeSubQueryParams from './create_stripe_sub_query_params';
import fetchExistingSubscription from './fetch_existing_subscription';
import createPayoutParams from './create_payout_params';
import createBulkPayout from './create_bulk_payout';

const handleSchedulilyPayout = () => {
  /**
   * TODO: Fetch all existing sub, filter by created date, should be created earlier than 3 days from now
   * Because Stripe will need couple of days to process payment
   * Group them by provider
   * Calculate sum amount to payout for provider
   * Initiate Payout
   */
  return composePromises(
    createStripeSubQueryParams,
    fetchExistingSubscription,
    createPayoutParams,
    createBulkPayout
  )();
}

export default handleSchedulilyPayout;