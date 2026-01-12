import axios from 'axios';

const API_BASE_URL = 'https://article-to-markdown.vercel.app';

export const fetchArticle = async (url, platform) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/fetch-article`, {
      url,
      platform
    });
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.error || 'Failed to fetch article. Please check the URL.'
    };
  }
};
