import execPreInitiateActions from './initiate/pre_initiate';
import execPreInitiateSpeculativeActions from './initiate/pre_initiate_speculative';
import execPreTransitionSpeculativeActions from './transition/pre_transition_speculative';
import { sdk } from "../sharetribe";
import transition from './transition/transition';
import query from './query';
import { addFinalizeResponseFnc } from '../utils';


const composeMRight = method => (...ms) => (
  ms.reduceRight((f, g) => x => g(x)[method](f))
);
//This one is used to inject your own logic onto the current execution
//Result of the previous function is the args of the current function
const composePromises = composeMRight('then');
/**
 * Add customize logic here
 */
const transactionWrapper = {
  transaction: {
    initiate: composePromises(
      //Add additional pre-initiate functions here
      execPreInitiateActions,
      sdk.jh.trustedTransactions.initiate
      //Add additional post-initiate function here
    ),
    initiateSpeculative: composePromises(
      execPreInitiateSpeculativeActions,
      sdk.jh.trustedTransactions.initiateSpeculative,
    ),
    transition,
    transitionSpeculative: composePromises(
      execPreTransitionSpeculativeActions,
      sdk.jh.trustedTransactions.transitionSpeculative
    ),
    query
  }
};

const finalizedTransactionWrapper = addFinalizeResponseFnc(transactionWrapper);

export default finalizedTransactionWrapper;