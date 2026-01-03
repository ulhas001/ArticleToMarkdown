export const detectPlatform = (url) => {
  if (!url) return '';
  if (url.includes('dev.to')) return 'devto';
  if (url.includes('medium.com')) return 'medium';
  return '';
};

export const getPlatformDisplayName = (platform) => {
  const names = {
    devto: 'dev.to',
    medium: 'Medium'
  };
  return names[platform] || '';
};
