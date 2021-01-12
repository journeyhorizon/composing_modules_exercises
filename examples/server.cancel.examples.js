import subscriptionSdk from "../services/subscription";

const example = () => {
  subscriptionSdk.cancel({
    id: 'sub_IiiHcCCLS3jkpl',
  })
    .then(data => {
      console.log(data);
    })
}
