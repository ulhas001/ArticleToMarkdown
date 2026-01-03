import { Home } from 'lucide-react';
import styles from './HomeButton.module.css';

export const HomeButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.button} title="Back to Home">
      <Home size={20} className={styles.icon} />
      <span className={styles.text}>New Article</span>
    </button>
  );
};
