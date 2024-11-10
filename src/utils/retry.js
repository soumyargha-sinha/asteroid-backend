const axios = require('axios');
const { random } = require('lodash');

const retryRequest = async (requestFn, retries, strategy, delay) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(error)
      attempt++;
      if (attempt >= retries) {
        throw error;
      }

      let waitTime = delay(attempt);
      console.log(`Attempt no=${attempt} failed. Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

const delayStrategies = {
  constant: (attempt) => 2000, // 2s for each
  linear: (attempt) => attempt * 1000, // 1s, 2s, 3s, ...
  exponential: (attempt) => Math.pow(2, attempt) * 1000, // 1s, 2s, 4s, ...
  randomized: (attempt) => {
    const baseDelay = Math.pow(2, attempt) * 1000; // Exponential base delay
    return baseDelay + random(-500, 500); // Randomness (±500ms)
  },
  fixedWindow: (attempt) => 10000, // 10 seconds
  slidingWindow: (attempt) => Math.min(10000, 1000 * attempt), // up to 10 seconds
  successiveHalving: (attempt) => Math.max(1000, 16000 / Math.pow(2, attempt)), // Half
};

const makeRetryRequest = async (requestFn, strategy, retries = 5) => {
  if (!delayStrategies[strategy]) {
    throw new Error(`Invalid retry strategy: ${strategy}`);
  }
  return await retryRequest(requestFn, retries, strategy, delayStrategies[strategy]);
};

module.exports = {
  makeRetryRequest,
};
