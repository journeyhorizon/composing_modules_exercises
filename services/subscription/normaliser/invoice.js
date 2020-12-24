import { pick } from "lodash";
import { types as sdkTypes } from '../../sharetribe';
import { convertObjToCamelCase } from "../../utils";
import { SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE } from "../attributes";
import {
  SUBSCRIPTION_INVOICE_PERIOD_TYPE,
  SUBSCRIPTION_INVOICE_TYPE
} from "../types";

const { UUID, Money } = sdkTypes;


const createLineItem = (lines) => {
  return lines.map(line => {
    const {
      id,
      amount,
      proration,
      quantity,
      currency: rawCurrency
    } = line;
    const currency = rawCurrency.toUpperCase();
    return {
      code: id,
      lineTotal: new Money(amount, currency),
      quantity,
      proration
    };
  })
}

const normaliseInvoice = ({ data: invoice }) => {
  const pickedInvoice = convertObjToCamelCase(pick(invoice, SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE));

  const {
    id,
    amountDue,
    amountPaid,
    amountRemaining,
    periodEnd,
    periodStart,
    statusTransitions,
    tax = 0,
    taxPercent,
    currency: rawCurrency,
    number,
    subtotal,
    total,
    lines
  } = pickedInvoice;

  const currency = rawCurrency.toUpperCase();

  return {
    data: {
      id: new UUID(id),
      type: SUBSCRIPTION_INVOICE_TYPE,
      attributes: {
        number,
        lineItems: createLineItem(lines.data),
        subtotal: new Money(subtotal, currency),
        payinTotal: new Money(total, currency),
        payoutTotal: new Money(total, currency),
        payDueTotal: new Money(amountDue, currency),
        paidTotal: new Money(amountPaid, currency),
        remainingTotal: new Money(amountRemaining, currency),
        statusTransitions,
        tax: new Money(tax, currency),
        taxPercent,
      },
      relationships: {
        booking: {
          data: {
            id: new UUID(id),
            type: SUBSCRIPTION_INVOICE_PERIOD_TYPE,
          }
        }
      }
    },
    included: [
      {
        id: new UUID(id),
        type: SUBSCRIPTION_INVOICE_PERIOD_TYPE,
        start: new Date(periodStart * 1000),
        end: new Date(periodEnd * 1000),
      },
    ],
  }
}

export default normaliseInvoice;