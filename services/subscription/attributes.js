export const SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE = [
  "id",
  "cancel_at_period_end",
  "current_period_end",
  "current_period_start",
  "items",
  "latest_invoice",
  "status",
  "days_until_due",
  "trial_end",
  "livemode"
];

export const SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE = [
  "id",
  "lines",
  "amount_due",
  "amount_paid",
  "amount_remaining",
  "currency",
  "period_end",
  "period_start",
  "tax",
  "tax_percent",
  "total_tax_amounts",
  "subtotal",
  "total",
  "status_transitions",
  "paid",
  "number",
  "status"
];

export const SUBSCRIPTION_LINE_ITEM_TO_TAKE_FROM_STRIPE = [
  "amount",
  "currency",
  "quantity",
  "proration",
  "id"
];

export const DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE = [
  "id",
  "cancel_at_period_end",
  "current_period_end",
  "current_period_start",
  "items",
  "latest_invoice",
  "status",
  "days_until_due",
  "trial_end",
  "livemode",
  "metadata",
  "tax_percent",
  "customer"
];

export const SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE = [
  "id",
  "metadata",
  "price",
  "quantity",
];

export const SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE = [
  "id",
  "interval",
  "interval_count",
  "livemode",
  "tiers",
  "tiers_mode",
  "currency",
  "amount",
  "amount_decimal",
  "billing_scheme",
  "nickname"
];

export const SUBSCRIPTION_PLAN_ATTRIBUTES_TO_TAKE_FROM_STRIPE = [
  "description",
  "name",
  "unit_label",
  "livemode",
  "images",
  "metadata"
];