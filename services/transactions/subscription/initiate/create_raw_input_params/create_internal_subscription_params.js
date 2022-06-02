import dayjs from 'dayjs';
import config from '../../../../config';
import {
  createFlexErrorObject,
  LISTING_TYPE_IS_NOT_SUBSCRIPTION_ERROR
} from "../../../../error";
import calculateCommissionPercentage from './calculate_commission_percentage';

const SUBSCRIPTION_LISTING_TYPE = 'subscription';


const createInternalSubscriptionParams = ({ params, transaction }) => {
  const {
    listing: {
      id: {
        uuid: listingId
      },
      attributes: {
        price: {
          currency
        },
        publicData: {
          type,
          subscriptionDuration
        }
      }
    },
    attributes: {
      createdAt,
      payinTotal: {
        amount: payinTotalAmount,
      },
      payoutTotal: {
        amount: payoutTotalAmount,
      }
    }
  } = transaction;

  if (type !== SUBSCRIPTION_LISTING_TYPE) {
    throw ({
      code: 400,
      data: createFlexErrorObject({
        code: 400,
        message: LISTING_TYPE_IS_NOT_SUBSCRIPTION_ERROR
      })
    });
  }

  const duration = parseInt(subscriptionDuration.split('M').join(), 10);

  const periodByEnv = config.env !== 'production'
    ? 'day' //For fast testing
    : 'month';

  return {
    ...params,
    //First payment is processed on Flex already, so the subscription start date is 1 month after the current date
    bookingStartTime: parseInt(dayjs(createdAt.getTime()).add(1, `${periodByEnv}s`).valueOf() / 1000, 10),
    bookingEndTime: parseInt(dayjs(createdAt.getTime()).add(duration, `${periodByEnv}s`).valueOf() / 1000, 10),
    commissionPercentage: calculateCommissionPercentage({
      payoutTotalAmount,
      payinTotalAmount
    }),
    lineItems: [
      {
        quantity: 1,
        priceData: {
          listingId,
          interval: {
            period: periodByEnv,
            count: 1
          },
          price: {
            amount: payinTotalAmount,
            currency
          }
        }
      }
    ],
  }
}

export default createInternalSubscriptionParams;