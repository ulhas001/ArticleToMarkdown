import { Code2, Eye } from 'lucide-react';
import styles from './ArticleViewer.module.css';

export const ArticleViewer = ({ viewMode, markdownContent, htmlContent }) => {
  const showMarkdown = viewMode === 'split' || viewMode === 'markdown';
  const showPreview = viewMode === 'split' || viewMode === 'original';

  return (
    <div className={`${styles.container} ${viewMode === 'split' ? styles.split : ''}`}>
      {showMarkdown && (
        <div className={styles.pane}>
          <div className={styles.header}>
            <Code2 size={18} />
            <h3 className={styles.title}>Markdown</h3>
          </div>
          <pre className={styles.markdown}>{markdownContent}</pre>
        </div>
      )}

      {showPreview && (
        <div className={styles.pane}>
          <div className={styles.header}>
            <Eye size={18} />
            <h3 className={styles.title}>Preview</h3>
          </div>
          <div 
            className={styles.preview}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      )}
    </div>
  );
};
