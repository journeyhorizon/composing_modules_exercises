import { composePromises } from "../../../../utils"
import fetchData from './fetch_data';
import checkSubscriptionInvoiceNeedUpdate from './check_requirements_invoice';
import createSubscriptionInvoiceUpdateParams from './create_params';
import fakePayCurrentInvoice from './fake_pay_current_invoice';
import finalise from "../../../../common/finalise";
import createSeparateCharge from "./create_separate_charge";


const handleInvoiceCreated = async ({ invoice }) => {
  return composePromises(
    fetchData,
    checkSubscriptionInvoiceNeedUpdate,
    createSubscriptionInvoiceUpdateParams,
    fakePayCurrentInvoice(invoice.id),
    createSeparateCharge(invoice),
    finalise
  )(invoice);
}

export default handleInvoiceCreated;