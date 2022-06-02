import config from "../../../config";
import { INVALID_TOKEN } from "../../../error";
import productStripeSdk from "../../../product";
import {
  EVENT_LISTING_CREATED,
  EVENT_TRANSACTION_TRANSITIONED,
  EVENT_SCHEDULY_PAYOUT
} from "./event_type";
import handleTransactionTransitioned from './handle_tranasction_transitioned';
import handleSchedulyPayout from './handle_scheduly_payout'

const receive = (event, signature) => {
  if (signature !== config.aws.lambda.secretSignature) {
    throw ({
      code: 403,
      message: INVALID_TOKEN
    })
  }
  const {
    attributes: {
      eventType
    },
    resource,
  } = event;

  switch (eventType) {
    case EVENT_LISTING_CREATED: {
      return productStripeSdk.create({
        id: resource.id.uuid
      })
        .then(data => ({
          code: 200,
          data
        }));
    }
    case EVENT_TRANSACTION_TRANSITIONED: {
      return handleTransactionTransitioned(resource);
    }
    case EVENT_SCHEDULY_PAYOUT: {
      return handleSchedulyPayout(resource);
    }
  }
}

export default receive;