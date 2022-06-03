import axios from 'axios';

// Axios configuration
const serverUrl = process.env.EXTERNAL_SERVER_URL;
const config = { headers : { 'Content-Type': 'application/json' } };

export const handler = async (event, context) => {
  const processPayout = await axios.post(serverUrl + '/', {}, config);
};