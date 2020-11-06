import { handleUserActionEvent } from '../../event';
import { sdk } from '../../sharetribe';
import execPreTransitActions from './pre_transition';

const composeMRight = method => (...ms) => (
  ms.reduceRight((f, g) => x => g(x)[method](f))
);
//This one is used to inject your own logic onto the current execution
//Result of the previous function is the args of the current function
const composePromises = composeMRight('then');

const handlePrivilegeTransition = composePromises(
  execPreTransitActions,
  sdk.jh.trustedTransactions.transition
);

const transition = async (fnParams) => {
  const { id, transition, params } = fnParams;

  const isEventHandleFlow = params.isEventOnly;

  return isEventHandleFlow
    ? handleUserActionEvent({
      id,
      action: transition,
      metadata: params
    })
    : handlePrivilegeTransition(fnParams);
}

export default transition;