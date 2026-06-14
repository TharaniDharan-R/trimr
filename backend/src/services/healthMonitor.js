import axios from 'axios';

export const checkUrlHealth = async (url) => {
  try {
    // Perform a HEAD request or a quick GET request to check HTTP status
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 4000,
      validateStatus: (status) => status >= 200 && status < 400, // redirect is fine too
    });
    return true;
  } catch (error) {
    console.warn(`Health check failed for target: ${url} - Reason: ${error.message}`);
    return false;
  }
};
