import { addFinalizeResponseFnc } from '../../utils';
import receive from './receive';

const webhook = {
  receive
};

const webhookSdk = addFinalizeResponseFnc(webhook);

export default webhookSdk;