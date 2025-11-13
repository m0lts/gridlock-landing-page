import axios from "axios";

const api = axios.create({
  baseURL: "https://v1.formula-1.api-sports.io",
  headers: {
    "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
    "x-rapidapi-host": "v1.formula-1.api-sports.io",
  },
  timeout: 15000, // 15 seconds timeout
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchF1Data = async (endpoint, retryCount = 0) => {
  try {
    // Validate inputs
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }
    
    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error("RapidAPI key is not configured. Please add VITE_RAPIDAPI_KEY to your .env file");
    }

    const response = await api.get(`/${endpoint}`);

    // Validate response
    if (!response.data) {
      throw new Error("Invalid response: no data received");
    }

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching F1 data from ${endpoint} (attempt ${retryCount + 1}):`,
      error.message
    );

    // Determine if we should retry
    const shouldRetry =
      retryCount < MAX_RETRIES &&
      (error.code === "ENOTFOUND" || // Network error
        error.code === "ECONNRESET" || // Connection reset
        error.code === "ETIMEDOUT" || // Timeout
        (error.response && error.response.status >= 500) || // Server error
        (error.response && error.response.status === 429)); // Rate limit

    if (shouldRetry) {
      const delayMs = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      await delay(delayMs);
      return fetchF1Data(endpoint, retryCount + 1);
    }

    // Enhance error messages for better user experience
    let enhancedError = error;

    if (error.code === "ENOTFOUND" || error.code === "ECONNRESET") {
      enhancedError = new Error(
        "Network connection failed. Please check your internet connection."
      );
    } else if (error.code === "ETIMEDOUT") {
      enhancedError = new Error("Request timed out. Please try again.");
    } else if (error.response) {
      if (error.response.status === 401) {
        enhancedError = new Error(
          "API authentication failed. Please check configuration."
        );
      } else if (error.response.status === 403) {
        enhancedError = new Error(
          "API access denied. Please check your subscription."
        );
      } else if (error.response.status === 429) {
        enhancedError = new Error(
          "Too many requests. Please wait a moment and try again."
        );
      } else if (error.response.status >= 500) {
        enhancedError = new Error(
          "F1 API service is temporarily unavailable. Please try again later."
        );
      }
    }

    throw enhancedError;
  }
};

