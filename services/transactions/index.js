import { addFinalizeResponseFnc } from '../utils';
import subscription from './subscription';

/**
 * Add customize logic here
 */
const transactionWrapper = {
  subscription,
};

const finalizedTransactionWrapper = addFinalizeResponseFnc(transactionWrapper);

export default finalizedTransactionWrapper;