import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <span className={styles.text}>Made with</span>
        <Heart className={styles.heart} size={16} />
        <span className={styles.text}>by</span>
        <a 
          href="https://github.com/ulhasbhalerao" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.name}
        >
          Ulhas Bhalerao
        </a>
      </div>
    </footer>
  );
};
