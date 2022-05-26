import { addFinalizeResponseFnc } from '../utils';
import subscription from './subscription';
import event from './event';

/**
 * Add customize logic here
 */
const transactionWrapper = {
  subscription,
  event
};

const finalizedTransactionWrapper = addFinalizeResponseFnc(transactionWrapper);

export default finalizedTransactionWrapper;