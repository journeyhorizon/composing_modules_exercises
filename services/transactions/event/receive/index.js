import config from "../../../config";
import { INVALID_TOKEN } from "../../../error";
import productStripeSdk from "../../../product";
import { EVENT_LISTING_CREATED, EVENT_TRANSACTION_TRANSITIONED } from "./event_type";

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
  }
}

export default receive;