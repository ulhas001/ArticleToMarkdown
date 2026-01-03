import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { useArticleFetcher } from './hooks/useArticleFetcher';
import { markdownToHtml } from './utils/markdownConverter';
import { downloadMarkdown, copyToClipboard } from './utils/fileDownloader';
import { UrlInput } from './components/UrlInput/UrlInput';
import { HomeButton } from './components/HomeButton/HomeButton';
import { ArticleHeader } from './components/ArticleHeader/ArticleHeader';
import { Editor } from './components/Editor/Editor';
import { ArticleViewer } from './components/ArticleViewer/ArticleViewer';
import { Footer } from './components/Footer/Footer';
import styles from './App.module.css';

function App() {
  const { article, loading, error, currentContent, fetchArticle, updateArticle, reset } = useArticleFetcher();
  const [viewMode, setViewMode] = useState('split');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMarkdown, setEditedMarkdown] = useState('');

  const handleFetch = (url, platform) => {
    fetchArticle(url, platform);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditedMarkdown(article.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    const newHtml = markdownToHtml(editedMarkdown);
    updateArticle(editedMarkdown, newHtml);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMarkdown(article.content);
    setIsEditing(false);
  };

  const handleDownload = () => {
    downloadMarkdown(article, currentContent);
  };

  const handleCopy = () => {
    const success = copyToClipboard(article, currentContent);
    if (success) {
      const button = document.getElementById('copy-button');
      const originalText = button.innerHTML;
      button.innerHTML = '<span class="flex items-center gap-2">✓ Copied</span>';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    }
  };

  const handleReset = () => {
    reset();
    setViewMode('split');
    setIsEditing(false);
    setEditedMarkdown('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.titleContainer}>
              <Wand2 className={styles.wandIcon} size={36} />
              <h1 className={styles.title}>Article → Markdown</h1>
            </div>
            <p className={styles.subtitle}>
              Transform your articles into markdown with elegance
            </p>
          </div>

          {!article && (
            <UrlInput onFetch={handleFetch} loading={loading} error={error} />
          )}

          {article && (
            <div className={styles.articleSection}>
              <HomeButton onClick={handleReset} />
              
              <ArticleHeader
                article={article}
                isEditing={isEditing}
                isEdited={currentContent !== article.content}
                viewMode={viewMode}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDownload={handleDownload}
                onCopy={handleCopy}
                onViewModeChange={setViewMode}
              />

              {isEditing ? (
                <Editor
                  value={editedMarkdown}
                  onChange={(e) => setEditedMarkdown(e.target.value)}
                  preview={markdownToHtml(editedMarkdown)}
                />
              ) : (
                <ArticleViewer
                  viewMode={viewMode}
                  markdownContent={article.content}
                  htmlContent={article.html_content}
                />
              )}
            </div>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
