const convertDynamoType2Json = (type, value) => {
  switch (type) {
    case 'N': {
      return parseFloat(value);
    }
    case 'B': {
      return Buffer.from(value);
    }
    case 'M': {
      return dynamoObject2Json(value);
    }
    case 'L': {
      return value.map(nestedValueObj => {
        const [nestedType, nestedValue] = Object.entries(nestedValueObj)[0];
        return convertDynamoType2Json(nestedType, nestedValue);
      });
    }
    case 'NULL': {
      return null;
    }
    default: {
      return value;
    }
  }
}

const dynamoObject2Json = dynamoObj => {
  return Object.entries(dynamoObj)
    .reduce((convertedData, [key, valueObj]) => {
      const [dataType, value] = Object.entries(valueObj)[0];
      convertedData[key] = convertDynamoType2Json(dataType, value)
      return convertedData;
    }, {})
}

const convertDynamoObj2Json = (dynamoData) => {
  if (!dynamoData) {
    return {};
  }
  return Array.isArray(dynamoData)
    ? dynamoData.map(dynamoObject2Json)
    : dynamoObject2Json(dynamoData);
}

module.exports = convertDynamoObj2Json;