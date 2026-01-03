import { Code2, Eye } from 'lucide-react';
import styles from './Editor.module.css';

export const Editor = ({ value, onChange, preview }) => {
  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <div className={styles.header}>
          <Code2 size={18} />
          <h3 className={styles.title}>Editor</h3>
        </div>
        <textarea
          value={value}
          onChange={onChange}
          className={styles.textarea}
          placeholder="Edit your markdown..."
        />
      </div>

      <div className={styles.previewPane}>
        <div className={styles.header}>
          <Eye size={18} />
          <h3 className={styles.title}>Preview</h3>
        </div>
        <div 
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>
    </div>
  );
};
