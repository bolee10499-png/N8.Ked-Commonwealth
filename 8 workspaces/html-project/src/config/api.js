export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  apiKey: process.env.REACT_APP_API_KEY || '',
  timeout: 30000
};

export const createApiClient = () => {
  const axios = require('axios');
  
  return axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      'X-API-Key': API_CONFIG.apiKey,
      'Content-Type': 'application/json'
    }
  });
};
