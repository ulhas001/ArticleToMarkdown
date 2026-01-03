import { Edit3, Save, X, FileDown, Code2 } from 'lucide-react';
import styles from './ArticleHeader.module.css';

export const ArticleHeader = ({
  article,
  isEditing,
  isEdited,
  viewMode,
  onEdit,
  onSave,
  onCancel,
  onDownload,
  onCopy,
  onViewModeChange
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h2 className={styles.title}>{article.title}</h2>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <div className={styles.dot}></div>
            {article.author}
          </span>
          <span>•</span>
          <span>
            {new Date(article.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          {isEdited && (
            <>
              <span>•</span>
              <span className={styles.editedBadge}>Edited</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {!isEditing ? (
          <>
            <button onClick={onEdit} className={`${styles.button} ${styles.purple}`}>
              <Edit3 size={18} />
              <span>Edit</span>
            </button>
            
            <button onClick={onDownload} className={`${styles.button} ${styles.green}`}>
              <FileDown size={18} />
              <span>Download</span>
            </button>
            
            <button id="copy-button" onClick={onCopy} className={`${styles.button} ${styles.white}`}>
              <svg className={styles.copyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={onSave} className={`${styles.button} ${styles.green}`}>
              <Save size={18} />
              <span>Save</span>
            </button>
            
            <button onClick={onCancel} className={`${styles.button} ${styles.white}`}>
              <X size={18} />
              <span>Cancel</span>
            </button>
          </>
        )}
      </div>

      {!isEditing && (
        <div className={styles.viewModeToggle}>
          <button
            onClick={() => onViewModeChange('split')}
            className={`${styles.toggleButton} ${viewMode === 'split' ? styles.active : ''}`}
          >
            Split
          </button>
          <button
            onClick={() => onViewModeChange('markdown')}
            className={`${styles.toggleButton} ${viewMode === 'markdown' ? styles.active : ''}`}
          >
            Markdown
          </button>
          <button
            onClick={() => onViewModeChange('original')}
            className={`${styles.toggleButton} ${viewMode === 'original' ? styles.active : ''}`}
          >
            Preview
          </button>
        </div>
      )}
    </div>
  );
};
