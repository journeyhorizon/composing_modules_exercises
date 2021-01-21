import { composePromises } from "../../../../utils"
import fetchData from './fetch_data';
import checkSubscriptionInvoiceNeedUpdate from './check_requirements_invoice';
import createSubscriptionInvoiceUpdateParams from './create_params';
import updateInvoice from './update_invoice';
import finalise from "../../../../common/finalise";


const handleInvoiceCreated = async ({ invoice }) => {
  return composePromises(
    fetchData,
    checkSubscriptionInvoiceNeedUpdate,
    createSubscriptionInvoiceUpdateParams,
    updateInvoice(invoice.id),
    finalise
  )(invoice);
}

export default handleInvoiceCreated;