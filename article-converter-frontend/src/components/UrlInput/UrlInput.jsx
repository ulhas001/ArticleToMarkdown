import { useState } from 'react';
import { Link2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { detectPlatform, getPlatformDisplayName } from '../../utils/platformDetector';
import styles from './UrlInput.module.css';

export const UrlInput = ({ onFetch, loading, error }) => {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setPlatform(detectPlatform(inputUrl));
  };

  const handleSubmit = () => {
    onFetch(url, platform);
  };

  return (
    <div className={styles.container}>
      <div className={styles.platformBadges}>
        <span className={styles.badge}>dev.to</span>
        <span className={`${styles.badge} ${styles.badgeGradient}`}>Medium</span>
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Paste article URL here..."
          className={styles.input}
        />
        <Link2 className={styles.icon} size={20} />
        
        {platform && (
          <div className={styles.detection}>
            <CheckCircle2 size={16} className={styles.checkIcon} />
            <span>{getPlatformDisplayName(platform)} detected</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !platform}
        className={styles.button}
      >
        {loading ? (
          <>
            <Loader2 className={styles.spinner} size={20} />
            <span>Fetching...</span>
          </>
        ) : (
          <>
            <span>Convert to Markdown</span>
            <Sparkles size={18} className={styles.sparkles} />
          </>
        )}
      </button>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
