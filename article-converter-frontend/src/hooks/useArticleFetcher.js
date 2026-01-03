import { useState, useRef } from 'react';
import { fetchArticle } from '../services/api';

export const useArticleFetcher = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentContentRef = useRef('');

  const fetch = async (url, platform) => {
    if (!url || !platform) {
      setError('Please enter a valid article URL');
      return;
    }

    setLoading(true);
    setError('');
    setArticle(null);

    const { data, error: apiError } = await fetchArticle(url, platform);
    
    if (apiError) {
      setError(apiError);
    } else {
      setArticle(data);
      currentContentRef.current = data.content;
    }
    
    setLoading(false);
  };

  const updateArticle = (newContent, newHtmlContent) => {
    currentContentRef.current = newContent;
    setArticle(prev => ({
      ...prev,
      content: newContent,
      html_content: newHtmlContent
    }));
  };

  const reset = () => {
    setArticle(null);
    setError('');
    currentContentRef.current = '';
  };

  return {
    article,
    loading,
    error,
    currentContent: currentContentRef.current,
    fetchArticle: fetch,
    updateArticle,
    reset
  };
};
