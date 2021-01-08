import { pick } from "lodash";
import {
  DETAILS_PRODUCT_ATTRIBUTES_TO_TAKE_FROM_STRIPE,
} from '../attributes';
import { types as sdkTypes } from 'sharetribe-flex-integration-sdk';
import { convertObjToCamelCase } from "../../utils";
import {
  PRODUCT_TYPE
} from "../types";

const { UUID } = sdkTypes;

const normaliseProduct = ({ data: rawSubscription }) => {
  const subscription = pick(rawSubscription,
    DETAILS_PRODUCT_ATTRIBUTES_TO_TAKE_FROM_STRIPE);

  const subscriptionInCamelCase = convertObjToCamelCase(subscription);
  const {
    id,
    description,
    metadata,
    name,
    object
  } = subscriptionInCamelCase;

  return {
    data: {
      id: new UUID(id),
      types: PRODUCT_TYPE,
      attributes: {
        description,
        name,
        object,
        protectedData: metadata.protectedData
          ? JSON.parse(metadata.protectedData)
          : {}
      },
    },
  }

}

export default normaliseProduct;