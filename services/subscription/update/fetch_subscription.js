import { denormalisedResponseEntities } from '../../sharetribe';
import getSubscription from '../get';

const fetchSubscription = (id) => {
  return getSubscription({ id })
    .then(res => denormalisedResponseEntities(res)[0]);
}

export default fetchSubscription;