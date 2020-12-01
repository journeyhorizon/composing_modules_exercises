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

export const SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE = [
  "id",
  "metadata",
  "quantity",
];