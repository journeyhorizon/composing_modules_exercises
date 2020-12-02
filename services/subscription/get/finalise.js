import { async } from "regenerator-runtime";

const finalise = async (subscription) => {
  return {
    code: 200,
    data: subscription
  };
}

export default finalise;