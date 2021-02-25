import payoutScheduler from '../services/payout_scheduler';

const runScheduler = () => {
  return payoutScheduler.create({
    stripeId: 'acct_1EMtLZJpupmaQvSh',
    params: {
      amount: 10000,
      currency: 'USD',
      triggerDate: 1614420916
    }
  })
}