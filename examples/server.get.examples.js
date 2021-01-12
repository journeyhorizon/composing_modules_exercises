import subscriptionSdk from "../services/subscription";

const example = () => {
  subscriptionSdk.get({
    id: 'sub_IiiHcCCLS3jkpl',
    include: ['invoices', 'upcomingInvoice']
  })
    .then(data => {
      console.log(data);
    })
}
