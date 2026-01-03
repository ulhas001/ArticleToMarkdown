const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  });
  
  // Inline code
  const codeBlocks = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `___CODE_${codeBlocks.length}___`;
    codeBlocks.push(`<code>${escapeHtml(code)}</code>`);
    return placeholder;
  });
  
  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
  // Blockquotes and horizontal rules
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^---$/gm, '<hr />');
  html = html.replace(/^\*\*\*$/gm, '<hr />');
  
  // Images and links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Restore inline code
  codeBlocks.forEach((code, index) => {
    html = html.replace(`___CODE_${index}___`, code);
  });
  
  // Lists
  const ulRegex = /^[-*+]\s+(.+)$/gm;
  let inUl = false;
  html = html.split('\n').map(line => {
    if (ulRegex.test(line)) {
      const content = line.replace(ulRegex, '$1');
      if (!inUl) {
        inUl = true;
        return `<ul><li>${content}</li>`;
      }
      return `<li>${content}</li>`;
    } else if (inUl) {
      inUl = false;
      return '</ul>\n' + line;
    }
    return line;
  }).join('\n');
  if (inUl) html += '</ul>';
  
  const olRegex = /^\d+\.\s+(.+)$/gm;
  let inOl = false;
  html = html.split('\n').map(line => {
    if (olRegex.test(line)) {
      const content = line.replace(olRegex, '$1');
      if (!inOl) {
        inOl = true;
        return `<ol><li>${content}</li>`;
      }
      return `<li>${content}</li>`;
    } else if (inOl) {
      inOl = false;
      return '</ol>\n' + line;
    }
    return line;
  }).join('\n');
  if (inOl) html += '</ol>';
  
  // Paragraphs
  html = html.split('\n\n').map(block => {
    if (block.match(/^<(h\d|ul|ol|blockquote|pre|hr|figure|img)/)) {
      return block;
    }
    const trimmed = block.trim();
    if (trimmed && !trimmed.startsWith('<')) {
      return `<p>${trimmed}</p>`;
    }
    return block;
  }).join('\n');
  
  return html;
};
