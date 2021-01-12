import subscriptionSdk from "../services/subscription";

const example = () => {
  subscriptionSdk.resume({
    id: 'sub_IiiHcCCLS3jkpl',
  })
    .then(data => {
      console.log(data);
    })
}
