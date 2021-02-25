import { addFinalizeResponseFnc } from '../utils';
import create from './create';
import update from './update';

const sdk = {
  create,
  update
};

const payoutQueueSdk = addFinalizeResponseFnc(sdk);

export default payoutQueueSdk;