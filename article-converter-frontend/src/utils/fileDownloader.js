export const generateFullMarkdown = (article, content) => {
  if (!article) return '';
  
  let markdown = `# ${article.title}\n\n`;
  markdown += `**Author:** ${article.author}\n\n`;
  markdown += `**Published:** ${new Date(article.published_at).toLocaleDateString()}\n\n`;
  
  if (article.tags && article.tags.length > 0) {
    const tags = Array.isArray(article.tags) 
      ? article.tags.map(tag => typeof tag === 'string' ? tag : tag.name).join(', ')
      : '';
    if (tags) {
      markdown += `**Tags:** ${tags}\n\n`;
    }
  }
  
  markdown += `**Original URL:** ${article.url}\n\n`;
  markdown += `---\n\n`;
  markdown += content;
  
  return markdown;
};

export const downloadMarkdown = (article, content) => {
  if (!article) return;

  const fullMarkdown = generateFullMarkdown(article, content);
  const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  const filename = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
};

export const copyToClipboard = (article, content) => {
  if (!article) return false;
  
  const fullMarkdown = generateFullMarkdown(article, content);
  navigator.clipboard.writeText(fullMarkdown);
  return true;
};
