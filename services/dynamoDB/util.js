export const promisifyAWSCall = func => params => {
  return new Promise((resolve, reject) => {
    func(params, (err, data) => {
      if (err) {
        reject({ ...err, status: 400 });
      }
      resolve(data);
    })
  });
}

//TODO: Update this function to get short abbreviated name instead of lazily taking everything capitalised.
//We add a prefix here to make the character avoid matching Dynamodb reserver keywords
//Details: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
export const generateShortAttrKeyName = currentKey => {
  return `${currentKey.toUpperCase()}JH`;
}

export const createExpressionAttributeNames = attributes => {
  const attrKeys = Object.keys(attributes);
  return attrKeys.reduce((result, currentKey) => {
    const shortName = `#${generateShortAttrKeyName(currentKey)}`;
    result[shortName] = currentKey;
    return result;
  }, {});
}

export const createExpressionAttributeValues = attributes => {
  const attrPairs = Object.entries(attributes);
  return attrPairs.reduce((result, [currentKey, currentValue]) => {
    const lowerShortName = `:${generateShortAttrKeyName(currentKey).toLowerCase()}`;
    result[lowerShortName] = currentValue;
    return result;
  }, {});
}

export const createUpdateExpression = attributes => {
  const attrKeys = Object.keys(attributes);
  const assignedStrMap = attrKeys.map((currentKey) => {
    const keyShortName = `#${generateShortAttrKeyName(currentKey)}`;
    const valueShortName = `:${generateShortAttrKeyName(currentKey).toLowerCase()}`;
    return `${keyShortName} = ${valueShortName}`;
  });
  return `SET ${assignedStrMap.join(', ')}`;
}

// operation can be [AND, OR]
export const createFilterExpression = (keyPairs, operation) => {
  const attrPairs = Object.entries(keyPairs);
  return attrPairs.map(([currentKey, currentValue]) => {
    const lowerShortName = `:${generateShortAttrKeyName(currentKey).toLowerCase()}`;
    return `${currentKey} = ${lowerShortName}`;
  })
    .join(` ${operation} `);
}