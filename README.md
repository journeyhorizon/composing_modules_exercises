# Setup

This service is tested with current Stripe version `2020-08-27`

## Precondition
Remember to setup these things before using this service
- Register `invoice.created` event to [Stripe's account webhook](https://stripe.com/docs/webhooks)
- Register for Stripe's beta test to use `on_behalf_of` for `invoice`
- Remember to check your Stripe's api version.
- Setup your `.env` file

## Install
```js
npm install
```
## Run for development
```js
npm run dev
```
## Run for production
```
NODE_ENV=production npm run start
```

# Guide

## Examples

Take a careful look at `examples` folder

## Coding styles

We are using a part of functional programming syntax to describe our logic.

You would see that we normally use `composePromises` function to compose a list of `async functions`

Ex: We want to fetch a subscription data and check if that subscription is paid or not, if it is paid we would send and email to the admin.

We would not do something imperative like this:

```js
const handleSubscriptionNotification = async(id) => {
  const subscriptionRes = await fetchSubscription(id);

  if (!subscriptionRes) {
    return {
      code: 404,
      message: 'Not found'
    };
  }

  if (subscriptionRes.status !== 'paid') {
    return {
      code: 400,
      message: 'Invalid status'
    };
  }

  const subscription = normaliseSubscriptionData(subscriptionRes);
  
  const emailObj = createEmailObj({
    type: SUBSCRIPTION_PAID_NOTIFICATION
  });

  return sendEmailToAdmin(emailObj);
}
```

We would do it like this:

```js
const handleSubscriptionNotification = composePromises(
  fetchSubscription,
  checkSubscriptionRequirement,
  normaliseSubscriptionData,
  createEmailObj,
  sendEmailToAdmin  
);
```

We would compose a list of functions to show in a clear way what we are trying to achieve, each developer should be responsible for their own function modules.

# Change log
## 2.1.0
- Added payout lambda function template to process and receive DynamoDB trigger for scheduling
- Added SDK payout_scheduler for creating schedule item on DB
## 2.0.0
- Stripe now support using `on_behalf_of` for subscription directly, update to use it
## 1.0.1
- Remove unused variable
- Change show logic to make it more default
## 1.0.0
- Subscription service for main account with customer
- Subscription service between connected account & customer
- Default webhook handle for `invoice.created` endpoint
- Default webhook placeholder for some important Stripe's subscription event `subscription.created`, `subscription.updated`, `subscription.deleted`
- Added examples on how to call for subscription in `server` and `web`