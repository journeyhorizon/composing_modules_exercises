import normaliser from "../normaliser";

const normaliseProductData = async (product) => {
  return normaliser.productDetails({ data: product });
}

export default normaliseProductData;